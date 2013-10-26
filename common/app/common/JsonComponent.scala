package common

import model._
import play.api.libs.json._
import play.api.libs.json.Json.toJson
import conf.Switches.AutoRefreshSwitch
import play.api.mvc.{ RequestHeader, Results, SimpleResult }
import play.api.templates.Html
import com.gu.management.Switchable
import conf.Configuration
import play.api.Play.current

object JsonComponent extends Results {

  type ListOfString = List[String]

  lazy val allowedOrigins = Configuration.ajax.corsOrigin.map(_.split(",").map(_.trim))

  private val ValidCallback = """([a-zA-Z0-9_]+)""".r

  def apply(html: Html)(implicit request: RequestHeader) = {
    val json = jsonFor(("html" -> html))
    resultFor(request, json)
  }

  def apply(metaData: MetaData, switches: Seq[Switchable], html: Html)(implicit request: RequestHeader) = {
    val json = jsonFor(metaData, switches, ("html" -> html))
    resultFor(request, json)
  }

  def apply(items: (String, Any)*)(implicit request: RequestHeader): SimpleResult = {
    val json = jsonFor(items: _*)
    resultFor(request, json)
  }
  
  def apply(metaData: MetaData, switches: Seq[Switchable], items: (String, Any)*)(implicit request: RequestHeader) = {
    val json = jsonFor(metaData, switches, items: _*)
    resultFor(request, json)
  }

  def apply(obj: JsObject)(implicit request: RequestHeader) = resultFor(request,
    Json.stringify(obj + ("refreshStatus" -> toJson(AutoRefreshSwitch.isSwitchedOn))))



  private def jsonFor(metaData: MetaData, switches: Seq[Switchable], items: (String, Any)*)(implicit request: RequestHeader): String = {
    jsonFor(("config" -> Json.parse(views.html.fragments.javaScriptConfig(metaData, switches).body)) +: items: _*)
  }
  
  private def jsonFor(items: (String, Any)*) = {
    import play.api.libs.json.Writes._
    Json.stringify(toJson(
      (items.toMap + ("refreshStatus" -> AutoRefreshSwitch.isSwitchedOn)).map {
        // compress and take the body if value is Html
        case (name, html: Html) => name -> toJson(html.body)
        case (name, value: String) => name -> toJson(value)
        case (name, value: Boolean) => name -> toJson(value)
        case (name, value: Int) => name -> toJson(value)
        case (name, value: Double) => name -> toJson(value)
        case (name, value: Float) => name -> toJson(value)
        case (name, value: ListOfString) => name -> toJson(value)
        case (name, value: JsValue) => name -> value
      }
    ))
  }

  private def resultFor(request: RequestHeader, json: String): SimpleResult = {
    // JSONP if it has a callback
    request.getQueryString("callback").map {
      case ValidCallback(callback) => Ok(s"$callback($json);").as("application/javascript")
      case badCallback => Forbidden("bad callback name")

    // Crossdomain if it has an origin header
    }.orElse{ request.headers.get("Origin").map{ origin =>
      val response = Ok(json).as("application/json")
        .withHeaders("Access-Control-Allow-Headers" -> "GET,POST,X-Requested-With")

      resolveOrigin(request) match {
        case Some(allowed) => response.withHeaders(allowed)
        case _ => response
      }

    // Same domain
    }}.getOrElse(Ok(json).as("application/json")).withHeaders("Vary" -> "Accept, Origin")
  }

  // http://stackoverflow.com/questions/1653308/access-control-allow-origin-multiple-origin-domains
  private def resolveOrigin(request: RequestHeader) = request.headers.get("Origin").flatMap{ requestOrigin =>
    allowedOrigins match {
      case Some(allowed) => allowed.find(_ == requestOrigin).map(domain => "Access-Control-Allow-Origin" -> domain)
      case None => Some("Access-Control-Allow-Origin" -> "*") // dev environments
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
