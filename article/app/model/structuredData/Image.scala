package model.structuredData

import model.{ImageAsset, ImageElement}
import play.api.libs.json.{JsString, JsValue, Json}
import views.support.Item700

object Image {

  def apply(picture: ImageElement): JsValue = {
    val asset: Option[ImageAsset] = Item700.bestFor(picture.images)
    Json.obj(
      "@type" -> "ImageObject",
      "url" -> JsString(Item700.bestSrcFor(picture.images).getOrElse("")),
      "height" -> asset.fold(0)(_.height),
      "width" -> asset.fold(0)(_.width),
    )
  }

}
