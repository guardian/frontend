package services

import org.joda.time.DateTime
import play.api.libs.json._

object PressType {
  implicit val jsonFormat = new Format[PressType] {
    override def reads(json: JsValue): JsResult[PressType] = json match {
      case JsString("live") => JsSuccess(Live)
      case JsString("draft") => JsSuccess(Draft)
      case _ => JsError("Content type must be either 'live' or 'draft'")
    }

    override def writes(o: PressType): JsValue = o match {
      case Live => JsString("live")
      case Draft => JsString("draft")
    }
  }
}

sealed trait PressType

case object Live extends PressType {
  override def toString = "Live"
}

case object Draft extends PressType {
  override def toString = "Draft"
}

object FrontPath {
  implicit val jsonFormat = new Format[FrontPath] {
    override def writes(o: FrontPath): JsValue = JsString(o.get)

    override def reads(json: JsValue): JsResult[FrontPath] = json match {
      case JsString(path) => JsSuccess(FrontPath(path))
      case _ => JsError("Front path must be a String")
    }
  }
}

case class FrontPath(get: String) extends AnyVal

object PressJob {
  implicit val jsonFormat = Json.format[PressJob]
}

case class PressJob(path: FrontPath, pressType: PressType, creationTime: DateTime = DateTime.now)

object CronUpdate {
  implicit val jsonFormat = Json.format[CronUpdate]
}

case class CronUpdate(path: FrontPath)
