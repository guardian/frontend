package discussion.model

import play.api.libs.json.{JsObject, JsArray, JsValue}

case class WitnessActivity(
    headline: String,
    webUrl: String,
    image: String
)

object WitnessActivity {
  def apply(json: JsValue): WitnessActivity = {
    WitnessActivity(
      headline = (json \ "headline").as[String],
      webUrl = (json \ "webUrl").as[String],
      image = ((json \ "updates").as[JsArray].value.head \ "image" \ "mediumlandscapecropdouble").as[String]
    )
  }
}
