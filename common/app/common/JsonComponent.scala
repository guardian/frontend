package common

import com.codahale.jerkson.{ Json => JsonParser }
import conf.CommonSwitches.AutoRefreshSwitch
import play.api.mvc.{ RequestHeader, Results }
import play.api.templates.Html

object JsonComponent extends Results {

  private val ValidCallback = """([a-zA-Z0-9_]+)""".r

  def apply(html: Html)(implicit request: RequestHeader) = {
    val json = jsonFor(("html" -> html))
    resultFor(request, json) getOrElse (Ok(html))
  }

  def apply(items: (String, Html)*)(implicit request: RequestHeader) = {
    val json = jsonFor(items: _*)
    resultFor(request, json) getOrElse (BadRequest("parameter 'callback' is required"))
  }

  private def jsonFor(items: (String, Html)*)(implicit request: RequestHeader) = {
    JsonParser.generate(
      (items.toMap).map {
        case (name, html) => (name -> Compressed(html).body)
      } ++ Map("refreshStatus" -> AutoRefreshSwitch.isSwitchedOn)
    )
  }

  private def resultFor(request: RequestHeader, json: String) = {
    request.getQueryString("callback").map {
      case ValidCallback(callback) => Ok("%s(%s);" format (callback, json)).as("application/javascript")
      case badCallback => Forbidden("bad callback name")
    }
  }
}
