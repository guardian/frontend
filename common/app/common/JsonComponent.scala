package common

import model._
import play.api.libs.json._
import play.api.libs.json.Json.toJson
import conf.CommonSwitches.AutoRefreshSwitch
import play.api.mvc.{AnyContent, Result, RequestHeader, Results}
import play.api.templates.Html
import com.gu.management.Switchable

object JsonComponent extends Results {

  private val ValidCallback = """([a-zA-Z0-9_]+)""".r

  def apply(html: Html)(implicit request: RequestHeader) = {
    val json = jsonFor(("html" -> html))
    resultFor(request, json) getOrElse (Ok(html))
  }
  
  def apply(metaData: MetaData, switches: Seq[Switchable], html: Html)(implicit request: RequestHeader) = {
    val json = jsonFor(metaData, switches, ("html" -> html))
    resultFor(request, json) getOrElse (Ok(html))
  }

  def apply(items: (String, Any)*)(implicit request: RequestHeader) = {
    val json = jsonFor(items: _*)
    resultFor(request, json) getOrElse (BadRequest("parameter 'callback' is required"))
  }
  
  def apply(metaData: MetaData, switches: Seq[Switchable], items: (String, Any)*)(implicit request: RequestHeader) = {
    val json = jsonFor(metaData, switches, items: _*)
    resultFor(request, json) getOrElse (BadRequest("parameter 'callback' is required"))
  }

  def apply(obj: JsObject)(implicit request: RequestHeader) = resultFor(request,
    Json.stringify(obj + ("refreshStatus" -> toJson(AutoRefreshSwitch.isSwitchedOn))))
    .getOrElse(BadRequest("parameter 'callback' is required"))


  def apply(callback: Option[String], items: (String, Any)*) = {
    var json = jsonFor(items: _*)
    callback.map {
      case ValidCallback(callback) => json = "%s(%s);" format (callback, json)
      case badCallback => Forbidden("bad callback name")
    }
    Ok(json).as("application/javascript")
  }
  
  def jsonFor(metaData: MetaData, switches: Seq[Switchable], items: (String, Any)*)(implicit request: RequestHeader): String = {
    jsonFor(("config" -> Json.parse(views.html.fragments.javaScriptConfig(metaData, switches).body)) +: items: _*)
  }
  
  def jsonFor(items: (String, Any)*) = {
    import play.api.libs.json.Writes._
    Json.stringify(toJson(
      (items.toMap + ("refreshStatus" -> AutoRefreshSwitch.isSwitchedOn)).map {
        // compress and take the body if value is Html
        case (name, html: Html) => (name -> toJson(Compressed(html).body))
        case (name, value: String) => (name -> toJson(value))
        case (name, value: Boolean) => (name -> toJson(value))
        case (name, value: Int) => (name -> toJson(value))
        case (name, value: Double) => (name -> toJson(value))
        case (name, value: Float) => (name -> toJson(value))
        case (name, value: JsValue) => (name -> value)
      }
    ))
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
