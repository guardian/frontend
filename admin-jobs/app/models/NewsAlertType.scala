package models

import play.api.libs.json._

import scala.util.{Failure, Success, Try}


sealed trait NewsAlertType
object NewsAlertTypes {
  case object Uk extends NewsAlertType { override def toString: String = "breaking/uk" }
  case object Us extends NewsAlertType { override def toString: String = "breaking/us" }
  case object Au extends NewsAlertType { override def toString: String = "breaking/au" }
  case object International extends NewsAlertType { override def toString: String = "breaking/international" }
  case object Sport extends NewsAlertType { override def toString: String = "breaking/sport" }
}

object NewsAlertType {
  import models.NewsAlertTypes._
  def fromString(s: String): Option[NewsAlertType] = PartialFunction.condOpt(s) {
    case "breaking/uk" => Uk
    case "breaking/us" => Us
    case "breaking/au" => Au
    case "breaking/international" => International
    case "breaking/sport" => Sport
  }

  def fromShortString(s: String): Option[NewsAlertType] = PartialFunction.condOpt(s) {
    case "uk" => Uk
    case "us" => Us
    case "au" => Au
    case "international" => International
    case "sport" => Sport
  }

  implicit val jf = new Format[NewsAlertType] {
    def reads(json: JsValue): JsResult[NewsAlertType] = json match {
      case JsString(s) => fromString(s) map { JsSuccess(_) } getOrElse JsError(s"$s is not a valid news alert type")
      case _ => JsError(s"News alert type could not be decoded")
    }

    def writes(obj: NewsAlertType): JsValue = JsString(obj.toString)
  }
}
