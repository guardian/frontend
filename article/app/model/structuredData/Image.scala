package model.structuredData

import model.ImageElement
import play.api.libs.json.{JsString, JsValue, Json}
import views.support.Item700

object Image {

  def apply(picture: ImageElement): JsValue =
    Json.obj(
      "@type" -> "ImageObject",
      "url" -> JsString(Item700.bestSrcFor(picture.images).getOrElse("")),
      "height" -> Item700.trueHeightFor(picture.images).getOrElse(0),
      "width" -> Item700.trueWidthFor(picture.images).getOrElse(0)
    )

}
