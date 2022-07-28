package model

import conf.switches.Switches.LongCacheSwitch
import org.joda.time.DateTime
import play.api.http.Writeable
import play.api.mvc._
import scala.math.max
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.Duration

case class CacheTime(cacheSeconds: Int, surrogateSeconds: Option[Int] = None)
object CacheTime {

  // 3800 seems slightly arbitrary, but our CDN caches to disk if above 3700
  // https://community.fastly.com/t/why-isnt-serve-stale-working-as-expected/369
  private val longCacheTime = 3800

  object Default extends CacheTime(60)
  object LiveBlogActive extends CacheTime(5, Some(60))
  object RecentlyUpdated extends CacheTime(60)
  // There is lambda which invalidates the cache on press events, so the facia cache time can be high.
  object Facia extends CacheTime(60, Some(900))
  object ArchiveRedirect extends CacheTime(60, Some(300))
  object ShareCount extends CacheTime(60, Some(600))
  object NotFound extends CacheTime(10) // This will be overwritten by fastly
  object DiscussionDefault extends CacheTime(60)
  object DiscussionClosed extends CacheTime(60, Some(longCacheTime))

  def LastDayUpdated: CacheTime = CacheTime(60, Some(longCacheTime))
  def NotRecentlyUpdated: CacheTime = CacheTime(60, Some(longCacheTime))
}

object Cached extends implicits.Dates {

  private val cacheableStatusCodes = Seq(200, 404)

  private val tenDaysInSeconds = 864000

  case class Hash(string: String)

  sealed trait CacheableResult { def result: Result }
  case class RevalidatableResult(result: Result, hash: Hash) extends CacheableResult
  case class WithoutRevalidationResult(result: Result) extends CacheableResult
  case class PanicReuseExistingResult(result: Result) extends CacheableResult

  object RevalidatableResult {
    def apply[C](result: Result, content: C)(implicit writeable: Writeable[C]): RevalidatableResult = {
      // hashing function from Arrays.java
      val hashLong: Long = writeable.transform(content).foldLeft(z = 1L) {
        case (accu, nextByte) => 31 * accu + nextByte
      }
      new RevalidatableResult(result, Hash(hashLong.toString))
    }

    def Ok[C](content: C)(implicit writeable: Writeable[C]): RevalidatableResult = {
      apply(Results.Ok(content), content)
    }

  }

  def apply(seconds: Int)(result: CacheableResult)(implicit request: RequestHeader): Result = {
    apply(CacheTime(seconds), result, request.headers.get("If-None-Match")) //FIXME could be comma separated
  }

  def apply(cacheTime: CacheTime)(result: CacheableResult)(implicit request: RequestHeader): Result = {
    apply(cacheTime, result, request.headers.get("If-None-Match"))
  }

  def apply(duration: Duration)(result: CacheableResult)(implicit request: RequestHeader): Result = {
    apply(CacheTime(duration.toSeconds.toInt), result, request.headers.get("If-None-Match"))
  }

  def apply(page: Page)(revalidatableResult: CacheableResult)(implicit request: RequestHeader): Result = {
    apply(page.metadata.cacheTime, revalidatableResult, request.headers.get("If-None-Match"))
  }

  // Use this when you are sure your result needs caching headers, even though the result status isn't
  // conventionally cacheable. Typically we only cache 200 and 404 responses.
  def explicitlyCache(seconds: Int)(result: Result): Result = cacheHeaders(CacheTime(seconds), result, None)

  def apply(cacheTime: CacheTime, cacheableResult: CacheableResult, ifNoneMatch: Option[String]): Result = {
    cacheableResult match {
      case RevalidatableResult(result, hash) if cacheableStatusCodes.contains(result.header.status) =>
        val etag = s"""W/"hash${hash.string}""""
        val newResult = if (ifNoneMatch.contains(etag)) Results.NotModified else result
        cacheHeaders(cacheTime, newResult, Some(etag))
      case WithoutRevalidationResult(result) if cacheableStatusCodes.contains(result.header.status) =>
        cacheHeaders(cacheTime, result, None)
      case PanicReuseExistingResult(result) =>
        cacheHeaders(cacheTime, result, ifNoneMatch)
      case result: CacheableResult => result.result
    }
  }

  private def cacheControl(maxAge: Int) = {
    val staleWhileRevalidateSeconds = max(maxAge / 10, 1)
    s"max-age=$maxAge, stale-while-revalidate=$staleWhileRevalidateSeconds, stale-if-error=$tenDaysInSeconds"
  }
  /*
    NOTE, if you change these headers make sure they are compatible with our Edge Cache

    see
    http://tools.ietf.org/html/rfc5861
    http://www.fastly.com/blog/stale-while-revalidate
    http://docs.fastly.com/guides/22966608/40347813

    This explains Surrogate-Control vs Cache-Control
    TLDR Surrogate-Control is used by the CDN, Cache-Control by the browser - do *not* add `private` to Cache-Control
    https://docs.fastly.com/guides/tutorials/cache-control-tutorial
   */
  private def cacheHeaders(cacheTime: CacheTime, result: Result, maybeEtag: Option[String]): Result = {
    val now = DateTime.now

    val surrogateMaxAge =
      cacheTime.surrogateSeconds.filter(_ => LongCacheSwitch.isSwitchedOn).getOrElse(cacheTime.cacheSeconds)

    val etagHeaderString: String = maybeEtag.getOrElse(
      s""""guRandomEtag${scala.util.Random.nextInt}${scala.util.Random.nextInt}"""", // setting a random tag still helps
    )

    result.withHeaders(
      // the cache headers used by the CDN
      "Surrogate-Control" -> cacheControl(surrogateMaxAge),
      // the cache headers that make their way through to the browser
      "Cache-Control" -> cacheControl(cacheTime.cacheSeconds),
      "Date" -> now.toHttpDateTimeString,
      "ETag" -> etagHeaderString,
    )
  }
}

object NoCache {
  def apply(result: Result): Result = result.withHeaders("Cache-Control" -> "private, no-store, no-cache")
}

case class NoCache[A](action: Action[A])(implicit val executionContext: ExecutionContext) extends Action[A] {

  override def apply(request: Request[A]): Future[Result] = {
    action(request) map { response =>
      response.withHeaders(
        ("Cache-Control", "private, no-store, no-cache"),
      )
    }
  }

  lazy val parser = action.parser
}
