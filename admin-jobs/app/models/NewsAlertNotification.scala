package models

import java.net.URI
import java.util.UUID

import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.json.Reads._
import play.api.data.validation._

import scala.util.{Failure, Success, Try}

case class NewsAlertNotification(id: UUID,
                                 title: String,
                                 message: String,
                                 thumbnailUrl: Option[URI] = None,
                                 link: URI,
                                 imageUrl: Option[URI] = None,
                                 publicationDate: DateTime,
                                 topics: Set[NewsAlertType] = Set.empty[NewsAlertType]) {


  def isOfType(alertType: NewsAlertType) : Boolean = topics.contains(alertType)

}

object NewsAlertNotification {

  import URIFormats._

  // publicationDate (DateTime)
  implicit val dtf = new Format[DateTime] {
    private val timeJsonFormatter = ISODateTimeFormat.dateTime().withZoneUTC()
    override def writes(dt: DateTime): JsValue = JsString(timeJsonFormatter.print(dt))
    override def reads(json: JsValue): JsResult[DateTime] = {
      val error = JsError("Value is expected to convert to DateTime")
      json match {
        case JsString(s) =>
          Try(timeJsonFormatter.parseDateTime(s)) match {
            case Success(dt) => JsSuccess(dt)
            case Failure(_) => error
          }
        case _ => error
      }
    }
  }

  // NewsAlertNotification serializer/deserializer
  implicit val jWrites = Json.writes[NewsAlertNotification]
  implicit val jReads: Reads[NewsAlertNotification] = (
    (__ \ "id").read[UUID] and
      (__ \ "title").read[String] and
      (__ \ "message").read[String] and
      (__ \ "thumbnailUrl").readNullable[URI] and
      (__ \ "link").read[URI] and
      (__ \ "imageUrl").readNullable[URI] and
      (__ \ "publicationDate").read[DateTime] and
      (__ \ "topics").read[Set[NewsAlertType]].filter(ValidationError("Notification should have at least one topic"))(_.nonEmpty)
    )(NewsAlertNotification.apply _)
}
