package model.deploys

import play.api.libs.json._

sealed trait NotifyRequestType
object NotifyTypes {
  case object Slack extends NotifyRequestType
}

object NotifyRequestType {
  def fromString(s: String): Option[NotifyRequestType] = PartialFunction.condOpt(s) {
    case "slack" => NotifyTypes.Slack
  }
  implicit val r = new Reads[NotifyRequestType] {
    def reads(json: JsValue): JsResult[NotifyRequestType] = json match {
      case JsString(s) => fromString(s).map{JsSuccess(_)}.getOrElse(JsError(s"$s is not a valid Notify type"))
      case _ => JsError("Notify type could not be decoded")
    }
  }
}

case class NotifyRequestNotices(`type`: NotifyRequestType, data: JsValue)
object NotifyRequestNotices { implicit val r = Json.reads[NotifyRequestNotices] }

case class NotifyRequestBody(step: NoticeStep, notices: List[NotifyRequestNotices])
object NotifyRequestBody { implicit val r = Json.reads[NotifyRequestBody] }
