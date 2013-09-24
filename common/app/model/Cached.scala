package model

import conf.Switches.DoubleCacheTimesSwitch
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import play.api.mvc.{ Result, SimpleResult, Results }
import scala.concurrent.{ExecutionContext, Future}

object Cached extends Results {

  def apply[A](seconds: Int)(result: Result): Result = result match {
    case ok: SimpleResult[_] if ok.header.status == 200 => cacheHeaders(seconds, ok)
    case other => other
  }

  def apply[A](metaData: MetaData)(result: Result): Result = result match {
    case ok: SimpleResult[_] if ok.header.status == 200 => cacheHeaders(metaData.cacheSeconds, ok)
    case other => other
  }

  def async[T](future: Future[T], seconds: Int = 60)(f: T => Result)(implicit executor: ExecutionContext): Result = Async {
    future map {
      t =>
        apply(seconds) { f(t) }
    }
  }

  private def cacheHeaders[A](seconds: Int, result: SimpleResult[A]) = {
    val now = DateTime.now
    val expiresTime = now + seconds.seconds
    val maxAge = if (DoubleCacheTimesSwitch.isSwitchedOn) seconds * 2 else seconds

    // see http://tools.ietf.org/html/rfc5861 for definitions of these headers
    result.withHeaders(
      "Cache-Control" -> s"max-age=$maxAge, s-maxage=$maxAge, stale-while-revalidate=$maxAge, stale-if-error=345600",
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString
    )
  }
}

object NoCache extends Results {
  def apply(result: Result) = result.withHeaders("Cache-Control" -> "no-cache", "Pragma" -> "no-cache")
}
