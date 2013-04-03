package model

import org.joda.time.DateTime

import org.scala_tools.time.Imports._
import play.api.mvc.{ Result, SimpleResult, Results }
import conf.CommonSwitches.DoubleCacheTimesSwitch

object Cached extends Results {

  def apply[A](seconds: Int)(result: Result): Result = result match {
    case ok: SimpleResult[_] if ok.header.status == 200 => cacheHeaders(seconds, ok)
    case other => other
  }

  def apply[A](metaData: MetaData)(result: Result): Result = result match {
    case ok: SimpleResult[_] if ok.header.status == 200 => cacheHeaders(metaData.cacheSeconds, ok)
    case other => other
  }

  private def cacheHeaders[A](seconds: Int, result: SimpleResult[A]) = {
    val now = DateTime.now
    val expiresTime = now + seconds.seconds
    val maxAge = if (DoubleCacheTimesSwitch.isSwitchedOn) seconds * 2 else seconds

    // see http://tools.ietf.org/html/rfc5861 for definitions of these headers
    result.withHeaders(
      "Cache-Control" -> s"public, max-age=$maxAge, stale-while-revalidate=$maxAge, stale-if-error=345600",
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString
    )
  }
}