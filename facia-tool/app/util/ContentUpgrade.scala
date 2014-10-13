package util

import play.api.libs.json._
import com.gu.openplatform.contentapi.model.{Content => ApiContent}

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

  def upgradeResponse(json: JsValue) = {
    json match {
      case jsObject: JsObject =>
        jsObject ++ JsObject(ContentFields flatMap { field =>
          jsObject \ field match {
            case JsArray(items) => Some(field -> JsArray(items.map(upgradeItem)))
            case item: JsObject => Some(field -> upgradeItem(item))
            case _ => None
          }
        })

      case x => x
    }
  }

  def upgradeItem(json: JsValue): JsValue = {

  }
}
