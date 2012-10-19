package common

import com.codahale.jerkson.{ Json => JsonParser }
import play.api.mvc.{ SimpleResult, RequestHeader, Results }
import play.api.templates.Html
import play.api.mvc.Results.EmptyContent

object JsonComponent extends Results {
  def apply(html: Html, etag: Option[String] = None)(implicit request: RequestHeader) = {

    val eTagMatched = etag.flatMap { etag =>
      request.headers.get("If-None-Match").find(_ == etag).map { t => NotModified }
    }

    val response = eTagMatched.getOrElse {
      val json = JsonParser.generate(Map("html" -> Compressed(html).body))
      request.getQueryString("callback").map { callback =>
        Ok("%s(%s);" format (callback, json)).as("application/javascript")
      } getOrElse (Ok(html))
    }

    etag.map(tag => response.withHeaders("ETag" -> tag)).getOrElse(response)
  }
}
