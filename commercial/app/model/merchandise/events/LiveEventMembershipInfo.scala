package commercial.model.merchandise.events

import play.api.libs.json._

case class LiveEventMembershipInfo(id: String, url: String, mainImageUrl: String)

object LiveEventMembershipInfo {
  implicit val format = Json.format[LiveEventMembershipInfo]

  // based on play.api.libs.json.LowPriorityDefaultReads.traversableReads
  implicit val readsLiveEventMembershipInfo = new Reads[Seq[LiveEventMembershipInfo]] {
    override def reads(json: JsValue): JsResult[Seq[LiveEventMembershipInfo]] = {
      json match {
        case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.asOpt[LiveEventMembershipInfo]))
        case _                 => JsError(JsonValidationError("error.expected.jsarray containing LiveEventMembershipInfo"))
      }
    }
  }
}
