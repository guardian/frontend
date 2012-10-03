package model

import org.joda.time.DateTime

import org.scala_tools.time.Imports._
import play.api.mvc.{ Result, SimpleResult, Results }

object Cached extends Results {

  def apply[A](seconds: Int)(result: Result): Result = result match {
    case ok: SimpleResult[_] if ok.header.status == 200 => cacheHeaders(seconds, ok)
    case other => other
  }

  def apply[A](metaData: MetaData)(result: Result): Result = result match {
    case ok: SimpleResult[_] if ok.header.status == 200 =>
      val secondsToCacheFor = metaData match {
        case c: Content if c.isLive => 5
        case c: Content if c.lastModified > DateTime.now - 24.hours => 60
        case c: Content => 900 //15 minutes

        case _ => 60
      }
      cacheHeaders(secondsToCacheFor, ok)

    case other => other
  }

  private def cacheHeaders[A](seconds: Int, result: SimpleResult[A]) = {
    val now = DateTime.now
    val expiresTime = now + seconds.seconds
    result.withHeaders(
      "Cache-Control" -> "must-revalidate, max-age=%s".format(seconds),
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString,
      "Vary" -> "host, accept-encoding"
    )
  }
}