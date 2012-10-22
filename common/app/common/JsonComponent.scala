package common

import com.codahale.jerkson.{ Json => JsonParser }
import play.api.mvc.{ RequestHeader, Results }
import play.api.templates.Html

object JsonComponent extends Results {
  def apply(html: Html, etag: Option[String] = None)(implicit request: RequestHeader) = {

    val json = JsonParser.generate(Map("html" -> Compressed(html).body))

    request.getQueryString("callback").map { callback =>
      val response = Ok("%s(%s);" format (callback, json)).as("application/javascript")
      etag.map(tag => response.withHeaders("ETag" -> tag)).getOrElse(response)
    } getOrElse (Ok(html))
  }
}
