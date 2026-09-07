package services.eventgraphic.models

import play.api.libs.json._

// Wraps the pressed representation of a Zug event's raw JSON payload - the shape isn't validated or typed here.
case class PressedEventData(json: JsObject)

object PressedEventData {
  implicit val format: OFormat[PressedEventData] = OFormat(
    Reads[PressedEventData](_.validate[JsObject].map(PressedEventData.apply)),
    OWrites[PressedEventData](_.json),
  )
}
