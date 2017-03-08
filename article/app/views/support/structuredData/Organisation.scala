package views.support.structuredData

import play.api.libs.json.{JsValue, Json}

object Organisation {

  def apply(): JsValue = Json.obj(
    "@type" -> "Organization",
    "name" -> "The Guardian",
    "logo" -> Json.obj(
      "@type" -> "ImageObject",
      "url" -> "https://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2015/10/1/1443713974413/Guardiantitlepiecedigitalon.png",
      "width" -> 300,
      "height" -> 60
    )
  )

}
