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

  def apply(items: (String, Any)*)(implicit request: RequestHeader) = {
    val json = jsonFor(items: _*)
    resultFor(request, json) getOrElse (BadRequest("parameter 'callback' is required"))
  }

  def apply(callback: Option[String], items: (String, Any)*) = {
    val json = jsonFor(items: _*)
    callback map {
      case ValidCallback(callback) => Ok("%s(%s);" format (callback, json)).as("application/javascript; charset=utf-8")
      case badCallback => Forbidden("bad callback name")
    } getOrElse Ok(json).as("application/json; charset=utf-8")
  }

  def jsonFor(items: (String, Any)*) = {
    JsonParser.generate(
      (items.toMap).map {
        // compress and take the body if value is Html
        case (name, html: Html) => (name -> Compressed(html).body)
        case (name, value) => (name -> value)
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

// you cannot simply return a 404 for JsonP see
// http://stackoverflow.com/questions/2493974/how-to-callback-a-function-on-404-in-json-ajax-request-with-jquery#answer-2537559
object JsonNotFound {

  private val ValidCallback = """([a-zA-Z0-9_]+)""".r

  def apply()(implicit request: RequestHeader) = request.getQueryString("callback").map {
    case ValidCallback(callback) => Ok("""%s({"status":404});""" format (callback)).as("application/javascript")
    case badCallback => Forbidden("bad callback name")
  }.getOrElse(NotFound)
}
