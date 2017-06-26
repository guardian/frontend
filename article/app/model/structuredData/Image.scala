package model.structuredData

import model.ImageElement
import play.api.libs.json.{JsValue, Json}
import views.support.Item700

object Image {

  def apply(picture: ImageElement): JsValue = {
    val url = Item700.bestSrcFor(picture.images).getOrElse("")
    val height = Item700.trueHeightFor(picture.images).getOrElse(0)
    val width = Item700.trueWidthFor(picture.images).getOrElse(0)

    Json.obj(
      "@type" -> "ImageObject",
      "url" -> url,
      "height" -> height,
      "width" -> width
    )
  }

}
