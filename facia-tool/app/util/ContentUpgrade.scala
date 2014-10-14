package util

import model.Content
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import com.gu.openplatform.contentapi.parser.JsonParser._
import org.json4s.JValue
import org.json4s.JsonAST._
import org.json4s.native.JsonMethods
import views.support.TrailCssClasses
import Json4s._

/** Helper for Facia tool - passes over the JSON that is proxied, adding in defaults */
object ContentUpgrade {
  val ContentFields = Seq(
    "content",
    "results",
    "relatedContent",
    "editorsPicks",
    "mostViewed",
    "storyPackage",
    "leadContent"
  )

  def rewriteBody(body: String) = {
    JsonMethods.compact(JsonMethods.render(upgradeResponse(JsonMethods.parse(body))))
  }

  def upgradeResponse(json: JValue) = {
    json \ "response" match {
      case jsObject: JObject =>
        JObject("response" -> (jsObject update JObject(ContentFields flatMap { field =>
          jsObject \ field match {
            case JArray(items) => Some(field -> JArray(items.map(upgradeItem)))
            case item: JObject => Some(field -> upgradeItem(item))
            case _ => None
          }
        }: _*)))

      case x => x
    }
  }

  def upgradeItem(json: JValue): JValue = {
    (json, json.extractOpt[ApiContent]) match {
      case (jsObj: JObject, Some(content)) =>
        val tone = TrailCssClasses.toneClass(Content(content))
        jsObj update JObject("tone" -> JString(tone))

      case _ =>
        json
    }
  }
}
