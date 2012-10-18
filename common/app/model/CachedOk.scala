package model

import org.joda.time.DateTime
import play.api.mvc.{ Result, Results }
import play.api.templates.Html

import org.scala_tools.time.Imports._

object CachedOk extends Results {

  /*
      Useful place to test headers:
        http://redbot.org/

      See:
        Cache revalidation: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9.4
        Expires: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
   */

  def apply(metaData: MetaData)(block: Html): Result = {

    val secondsToCacheFor = metaData match {
      case c: Content if c.isLive => 5
      case c: Content if c.lastModified > DateTime.now - 24.hours => 60
      case c: Content => 900 //15 minutes

      case _ => 60
    }

    val now = DateTime.now
    val expiresTime = now + secondsToCacheFor.seconds

    Ok(block).withHeaders(
      "Cache-Control" -> "max-age=%s".format(secondsToCacheFor),
      "Expires" -> expiresTime.toHttpDateTimeString,
      "Date" -> now.toHttpDateTimeString
    )
  }
}