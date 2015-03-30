package util

import fronts.MetadataDefaults
import model.Content
import com.gu.contentapi.client.model.{Content => ApiContent}
import com.gu.contentapi.client.parser.JsonParser._
import org.json4s.JValue
import org.json4s.JsonAST._
import org.json4s.native.JsonMethods
import Json4s._
import views.support.CardStyle

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
        val frontendContent = Content(content)

        val metaDataDefaults = MetadataDefaults(frontendContent)
        val cardStyle = CardStyle(frontendContent)

        import org.json4s.JsonDSL._

        jsObj update ("frontsMeta" ->
          ("defaults" -> metaDataDefaults) ~
          ("tone" -> cardStyle.toneString))

      case _ =>
        json
    }
  }
}
