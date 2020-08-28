package model.structuredData

import play.api.libs.json.{JsValue, Json}

object Organisation {

  def apply(): JsValue =
    Json.obj(
      "@type" -> "Organization",
      "@id" -> "https://www.theguardian.com#publisher",
      "@context" -> "http://schema.org",
      "name" -> "The Guardian",
      "logo" -> Json.obj(
        "@type" -> "ImageObject",
        "url" -> "https://uploads.guim.co.uk/2018/01/31/TheGuardian_AMP.png",
        "width" -> 190,
        "height" -> 60,
      ),
    )

}
