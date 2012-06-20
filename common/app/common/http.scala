package common

import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.mvc.{ Result, Results }
import play.api.templates.Html

import org.scala_tools.time.Imports._

object CachedOk extends Results {

  //  usefull place to test headers
  //  http://redbot.org/

  def apply(metaData: MetaData)(block: Html): Result = {
    Ok(block).withHeaders {
      metaData match {
        case c: Content if c.isLive => "Cache-Control" -> "must-revalidate, max-age=5"
        case c: Content if c.lastModified > DateTime.now - 24.hours => "Cache-Control" -> "must-revalidate, max-age=60"
        case c: Content => "Cache-Control" -> "must-revalidate, max-age=900" //15 minutes

        case _ => "Cache-Control" -> "must-revalidate, max-age=60"
      }
    }
  }
}