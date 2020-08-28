package model

import conf.switches.Switches.LongCacheSwitch
import org.joda.time.DateTime
import com.github.nscala_time.time.Implicits._
import play.api.http.Writeable
import play.api.mvc._
import scala.math.{max, min}
import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration.Duration

case class CacheTime(cacheSeconds: Int)
object CacheTime {

  // 3800 seems slightly arbitrary, but our CDN caches to disk if above 3700
  // https://community.fastly.com/t/why-isnt-serve-stale-working-as-expected/369
  private def extended(cacheTime: Int) = if (LongCacheSwitch.isSwitchedOn) 3800 else cacheTime

  object Default extends CacheTime(60)
  object LiveBlogActive extends CacheTime(5)
  object RecentlyUpdated extends CacheTime(60)
  // There is lambda which invalidates the cache on press events, so the facia cache time can be high.
  object Facia extends CacheTime(900)
  object ArchiveRedirect extends CacheTime(300)
  object ShareCount extends CacheTime(600)
  object NotFound extends CacheTime(10) // This will be overwritten by fastly
  object DiscussionDefault extends CacheTime(60)
  object DiscussionClosed extends CacheTime(3800)
  object ServiceWorker extends CacheTime(600)
  object WebAppManifest extends CacheTime(3800)

  def LastDayUpdated: CacheTime = CacheTime(extended(60))
  def NotRecentlyUpdated: CacheTime = CacheTime(extended(300))
  def NotRecentlyUpdatedPurgable: CacheTime = CacheTime(extended(1800))
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
    apply(seconds, result, request.headers.get("If-None-Match")) //FIXME could be comma separated
  }

  def apply(cacheTime: CacheTime)(result: CacheableResult)(implicit request: RequestHeader): Result = {
    apply(cacheTime.cacheSeconds, result, request.headers.get("If-None-Match"))
  }

  def apply(duration: Duration)(result: CacheableResult)(implicit request: RequestHeader): Result = {
    apply(duration.toSeconds.toInt, result, request.headers.get("If-None-Match"))
  }

  def apply(page: Page)(revalidatableResult: CacheableResult)(implicit request: RequestHeader): Result = {
    val cacheSeconds = page.metadata.cacheTime.cacheSeconds
    apply(cacheSeconds, revalidatableResult, request.headers.get("If-None-Match"))
  }

  // Use this when you are sure your result needs caching headers, even though the result status isn't
  // conventionally cacheable. Typically we only cache 200 and 404 responses.
  def explicitlyCache(seconds: Int)(result: Result): Result = cacheHeaders(seconds, result, None)

  def apply(seconds: Int, cacheableResult: CacheableResult, ifNoneMatch: Option[String]): Result = {
    cacheableResult match {
      case RevalidatableResult(result, hash) if cacheableStatusCodes.contains(result.header.status) =>
        val etag = s"""W/"hash${hash.string}""""
        val newResult = if (ifNoneMatch.contains(etag)) Results.NotModified else result
        cacheHeaders(seconds, newResult, Some(etag))
      case WithoutRevalidationResult(result) if cacheableStatusCodes.contains(result.header.status) =>
        cacheHeaders(seconds, result, None)
      case PanicReuseExistingResult(result) =>
        cacheHeaders(seconds, result, ifNoneMatch)
      case result: CacheableResult => result.result
    }
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
  private def cacheHeaders(maxAge: Int, result: Result, maybeEtag: Option[String]): Result = {
    val now = DateTime.now
    val staleWhileRevalidateSeconds = max(maxAge / 10, 1)
    val surrogateCacheControl =
      s"max-age=$maxAge, stale-while-revalidate=$staleWhileRevalidateSeconds, stale-if-error=$tenDaysInSeconds"

    val cacheControl = if (LongCacheSwitch.isSwitchedOn) {
      val browserMaxAge = min(maxAge, 60)
      val browserStaleWhileRevalidateSeconds = max(browserMaxAge / 10, 1)
      s"max-age=$browserMaxAge, stale-while-revalidate=$browserStaleWhileRevalidateSeconds, stale-if-error=$tenDaysInSeconds"
    } else {
      surrogateCacheControl
    }

    val etagHeaderString: String = maybeEtag.getOrElse(
      s""""guRandomEtag${scala.util.Random.nextInt}${scala.util.Random.nextInt}"""", // setting a random tag still helps
    )

    result.withHeaders(
      // the cache headers used by the CDN
      "Surrogate-Control" -> surrogateCacheControl,
      // the cache headers that make their way through to the browser
      "Cache-Control" -> cacheControl,
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
