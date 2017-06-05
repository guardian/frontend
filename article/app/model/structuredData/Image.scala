package model.structuredData

import model.ImageElement
import play.api.libs.json.{JsValue, Json}
import views.support.{ImgSrc, Item700}

object Image {

  def apply(picture: ImageElement): JsValue = Json.obj(
    "@type" -> "ImageObject",
    "url" -> ImgSrc.findNearestSrc(picture.images, Item700),
    "height" -> ImgSrc.getFallbackAsset(picture.images).fold(0)(_.height),
    "width" -> ImgSrc.getFallbackAsset(picture.images).fold(0)(_.width)
  )

}
