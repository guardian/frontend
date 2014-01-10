package model

import conf.Switches.DoubleCacheTimesSwitch
import org.joda.time.DateTime
import org.scala_tools.time.Imports._
import play.api.mvc.{ SimpleResult, Results }

object Cached extends Results with implicits.Dates {

  private val cacheableStatusCodes = Seq(200, 404)

  def apply(seconds: Int)(result: SimpleResult): SimpleResult = {
    if (cacheableStatusCodes.exists(_ == result.header.status)) cacheHeaders(seconds, result) else result
  }

  def apply(metaData: MetaData)(result: SimpleResult): SimpleResult = {
    if (cacheableStatusCodes.exists(_ == result.header.status)) cacheHeaders(metaData.cacheSeconds, result) else result
  }

  private def cacheHeaders(seconds: Int, result: SimpleResult) = {
    val now = DateTime.now
    val expiresTime = now + seconds.seconds
    val maxAge = if (DoubleCacheTimesSwitch.isSwitchedOn) seconds * 2 else seconds

    // NOTE, if you change these headers make sure they are compatible with our Edge Cache

    // see http://tools.ietf.org/html/rfc5861 for definitions of these headers
    result.withHeaders(
      "Cache-Control" -> s"max-age=$maxAge",
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString
    )
  }
}

object NoCache extends Results {
  def apply(result: SimpleResult): SimpleResult = result.withHeaders("Cache-Control" -> "no-cache", "Pragma" -> "no-cache")
}
