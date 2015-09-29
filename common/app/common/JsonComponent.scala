package common

import model._
import play.api.libs.json._
import play.api.libs.json.Json.toJson
import conf.switches.Switches.AutoRefreshSwitch
import play.api.mvc.{ RequestHeader, Results, Result }
import play.twirl.api.Html
import play.api.http.ContentTypes._

object JsonComponent extends Results with implicits.Requests {

  def apply(html: Html)(implicit request: RequestHeader): Result = {
    val json = jsonFor("html" -> html)
    resultFor(request, json)
  }

  def apply(metaData: MetaData, html: Html)(implicit request: RequestHeader): Result = {
    val json = jsonFor(metaData, "html" -> html)
    resultFor(request, json)
  }

  def apply(items: (String, Any)*)(implicit request: RequestHeader): Result = {
    val json = jsonFor(items: _*)
    resultFor(request, json)
  }

  def apply(metaData: MetaData, items: (String, Any)*)(implicit request: RequestHeader): Result = {
    val json = jsonFor(metaData, items: _*)
    resultFor(request, json)
  }

  def apply(obj: JsObject)(implicit request: RequestHeader): Result = resultFor(request,
    Json.stringify(obj + ("refreshStatus" -> toJson(AutoRefreshSwitch.isSwitchedOn))))

  def forJsValue(json: JsValue)(implicit request: RequestHeader): Result = resultFor(
    request,
    Json.stringify(json)
  )

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
        case (name, value: Seq[_]) if value.forall(_.isInstanceOf[String]) => name -> toJson(value.asInstanceOf[Seq[String]])
        case (name, value: JsValue) => name -> value
      }
    ))
  }

  // Note we are not setting Vary headers here as they get set in CorsVaryHeadersFilter
  // otherwise they get overwritten by the Gzip Filter
  private def resultFor(request: RequestHeader, json: String): Result = {
    Cors(Ok(json).as(JSON))(request)
  }
}

object JsonNotFound {

  def apply()(implicit request: RequestHeader): Result = {
    Cors(NotFound.as(JSON))(request)
  }
}
