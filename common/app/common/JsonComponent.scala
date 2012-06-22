package common

import com.codahale.jerkson.{ Json => JsonParser }
import play.api.mvc.{ RequestHeader, Results }
import play.api.templates.Html

object JsonComponent extends Results {
  def apply(html: Html)(implicit request: RequestHeader) = {

    val json = JsonParser.generate(Map("html" -> Compressed(html).body))

    request.getQueryString("callback").map { callback =>
      Ok("%s(%s);" format (callback, json)).as("application/javascript")
    } getOrElse (Ok(json).as("application/json"))
  }
}
