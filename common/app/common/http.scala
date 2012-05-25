package common

import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.api.mvc.{ Result, Results }
import play.api.templates.Html

import org.scala_tools.time.Imports._

object CachedOk extends Results {
  def apply(metaData: MetaData)(block: Html): Result = {
    Ok(block).withHeaders {
      metaData match {
        case c: Content if c.isLive => "Cache-Control" -> "public, max-age=5"
        case c: Content if c.lastModified > DateTime.now - 24.hours => "Cache-Control" -> "public, max-age=60"
        case c: Content => "Cache-Control" -> "public, max-age=900" //15 minutes

        case _ => "Cache-Control" -> "public, max-age=60"
      }
    }
  }
}