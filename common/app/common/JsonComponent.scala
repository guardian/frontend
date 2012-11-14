package common

import com.codahale.jerkson.{ Json => JsonParser }
import play.api.mvc.{ RequestHeader, Results }
import play.api.templates.Html

object JsonComponent extends Results {

  private val ValidCallback = """([a-zA-Z0-9]+)""".r

  def apply(html: Html)(implicit request: RequestHeader) = {
    val json = JsonParser.generate(Map("html" -> Compressed(html).body))
    resultFor(request, json) getOrElse (Ok(html))
  }

  def apply(items: (String, Html)*)(implicit request: RequestHeader) = {
    val json = JsonParser.generate(
      items.toMap.map { case (name, html) => (name -> Compressed(html).body) }
    )
    resultFor(request, json) getOrElse (BadRequest("parameter 'callback' is required"))
  }

  private def resultFor(request: RequestHeader, json: String) = {
    request.getQueryString("callback").map {
      case ValidCallback(callback) => Ok("%s(%s);" format (callback, json)).as("application/javascript")
      case badCallback => Forbidden("bad callback name")
    }
  }
}
