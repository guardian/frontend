package common

import model._
import play.api.libs.json._
import play.api.libs.json.Json.toJson
import conf.Switches.AutoRefreshSwitch
import play.api.mvc.{ RequestHeader, Results, SimpleResult }
import play.api.templates.Html
import play.api.http.ContentTypes._

object JsonComponent extends Results with implicits.Requests {

  type ListOfString = List[String]

  private val ValidCallback = """([a-zA-Z0-9_]+)""".r

  def apply(html: Html)(implicit request: RequestHeader): SimpleResult = {
    val json = jsonFor("html" -> html)
    resultFor(request, json)
  }

  def apply(metaData: MetaData, html: Html)(implicit request: RequestHeader): SimpleResult = {
    val json = jsonFor(metaData, "html" -> html)
    resultFor(request, json)
  }

  def apply(items: (String, Any)*)(implicit request: RequestHeader): SimpleResult = {
    val json = jsonFor(items: _*)
    resultFor(request, json)
  }
  
  def apply(metaData: MetaData, items: (String, Any)*)(implicit request: RequestHeader): SimpleResult = {
    val json = jsonFor(metaData, items: _*)
    resultFor(request, json)
  }

  def apply(obj: JsObject)(implicit request: RequestHeader): SimpleResult = resultFor(request,
    Json.stringify(obj + ("refreshStatus" -> toJson(AutoRefreshSwitch.isSwitchedOn))))



  private def jsonFor(metaData: MetaData, items: (String, Any)*)(implicit request: RequestHeader): String = {
    jsonFor(("config" -> Json.parse(views.html.fragments.javaScriptConfig(metaData).body)) +: items: _*)
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

  private def resultFor(request: RequestHeader, json: String): SimpleResult = jsonp(request, json)
    .orElse(cors(request, json))
    .getOrElse(Ok(json).as(JSON)).withHeaders("Vary" -> "Accept, Origin")

  private def cors(request: RequestHeader, json: String) = request.headers.get("Origin").map { origin =>
      Cors(Ok(json).as(JSON).withHeaders("Access-Control-Allow-Headers" -> "GET,POST,X-Requested-With"))(request)
  }

  // TODO we probably want to kill off JsonP - I do not think we intend to use it again
  private def jsonp(request: RequestHeader, json: String): Option[SimpleResult] = request.getQueryString("callback").map{
    case ValidCallback(callback) => Ok(s"$callback($json);").as(withCharset("application/javascript"))
    case badCallback => Forbidden("bad callback name")
  }
}

// you cannot simply return a 404 for JsonP see
// http://stackoverflow.com/questions/2493974/how-to-callback-a-function-on-404-in-json-ajax-request-with-jquery#answer-2537559
object JsonNotFound {

  private val ValidCallback = """([a-zA-Z0-9_]+)""".r

  def apply()(implicit request: RequestHeader): SimpleResult = jsonp(request).orElse(cors(request)).getOrElse(NotFound)

  private def cors(request: RequestHeader) = request.headers.get("Origin").map { origin =>
    Cors(NotFound.as(JSON).withHeaders("Access-Control-Allow-Headers" -> "GET,POST,X-Requested-With"))(request)
  }

  // TODO we probably want to kill off JsonP - I do not think we intend to use it again
  private def jsonp(request: RequestHeader) = request.getQueryString("callback").map {
    case ValidCallback(callback) => Ok( s"""$callback({"status":404});""").as(withCharset("application/javascript"))
    case badCallback => Forbidden("bad callback name")
  }
}
