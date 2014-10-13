package util

import model.Content
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import com.gu.openplatform.contentapi.parser.JsonParser._
import org.json4s.JValue
import org.json4s.JsonAST._
import org.json4s.native.JsonMethods
import views.support.TrailCssClasses

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
        println("is a jsobject")

        JObject("response" -> (jsObject ++ JObject(ContentFields flatMap { field =>
          jsObject \ field match {
            case JArray(items) => Some(field -> JArray(items.map(upgradeItem)))
            case item: JObject => Some(field -> upgradeItem(item))
            case _ =>
              println("Could not find " + field)
              None
          }
        }: _*)))

      case x => x
    }
  }

  def upgradeItem(json: JValue): JValue = {
    json.extractOpt[ApiContent] match {
      case Some(content) =>
        val tone = TrailCssClasses.toneClass(Content(content))

        json match {
          case jsObj: JObject =>
            println("Adding tone to " + content.id)
            jsObj merge JObject("tone" -> JString(tone))

          case _ =>
            println("Json wasn't a jsObj")
            json
        }

      case None =>
        println("Couldn't deserialize, doh")
        json
    }
  }
}
