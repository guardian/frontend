package model

import conf.switches.Switches._
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import play.api.mvc.{Request, Action, Result}
import scala.concurrent.Future
import scala.concurrent.duration.Duration
import scala.concurrent.ExecutionContext.Implicits.global

case class CacheTime(cacheSeconds: Int)
object CacheTime {

  object LiveBlogActive extends CacheTime(5)
  object RecentlyUpdated extends CacheTime(10)
  object LastDayUpdated extends CacheTime(30)
  object NotRecentlyUpdated extends CacheTime(300)
  object Default extends CacheTime(60)
  object RecentlyUpdatedPurgable extends CacheTime(300)
  object LastDayUpdatedPurgable extends CacheTime(1200)
  object NotRecentlyUpdatedPurgable extends CacheTime(1800)

}

object Cached extends implicits.Dates {

  private val cacheableStatusCodes = Seq(200, 404)

  private val tenDaysInSeconds = 864000

  def apply(seconds: Int)(result: Result): Result = {
    if (cacheableStatusCodes.contains(result.header.status)) cacheHeaders(seconds, result) else result
  }

  def apply(duration: Duration)(result: Result): Result = {
    apply(duration.toSeconds.toInt)(result)
  }

  def apply(page: Page)(result: Result): Result = {
    val cacheSeconds = page.metadata.cacheTime.cacheSeconds
    if (cacheableStatusCodes.contains(result.header.status)) cacheHeaders(cacheSeconds, result) else result
  }

  // Use this when you are sure your result needs caching headers, even though the result status isn't
  // conventionally cacheable. Typically we only cache 200 and 404 responses.
  def explicitlyCache(seconds: Int)(result: Result): Result = cacheHeaders(seconds, result)

  private def cacheHeaders(seconds: Int, result: Result) = {
    val now = DateTime.now
    val expiresTime = now + seconds.seconds
    val maxAge = if (DoubleCacheTimesSwitch.isSwitchedOn) seconds * 2 else seconds

    // NOTE, if you change these headers make sure they are compatible with our Edge Cache

    // see
    // http://tools.ietf.org/html/rfc5861
    // http://www.fastly.com/blog/stale-while-revalidate
    // http://docs.fastly.com/guides/22966608/40347813
    val staleWhileRevalidateSeconds = math.max(maxAge / 10, 1)
    val cacheControl = s"max-age=$maxAge, stale-while-revalidate=$staleWhileRevalidateSeconds, stale-if-error=$tenDaysInSeconds"
    result.withHeaders(
      "Surrogate-Control" -> cacheControl,
      "Cache-Control" -> cacheControl,
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString,
      "ETag" -> s"johnTest${scala.util.Random.nextInt}${scala.util.Random.nextInt}" // see if we get any If-None-Match requests
    )
  }
}

object NoCache {
  def apply(result: Result): Result = result.withHeaders("Cache-Control" -> "no-cache", "Pragma" -> "no-cache")
}

case class NoCache[A](action: Action[A]) extends Action[A] {

  override def apply(request: Request[A]): Future[Result] = {

    action(request) map { response =>
      response.withHeaders(
        ("Cache-Control", "no-cache, no-store, must-revalidate"),
        ("Pragma", "no-cache"),
        ("Expires", "0")
      )
    }
  }

  lazy val parser = action.parser
}
