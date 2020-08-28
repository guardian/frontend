package models

import java.net.URI
import java.util.UUID
import org.joda.time.DateTime
import org.joda.time.format.ISODateTimeFormat
import play.api.libs.json._
import scala.util.{Failure, Success, Try}

case class NewsAlertNotification(
    uid: UUID,
    urlId: URI, //ex: technology/2016/feb/01/uninstalling-facebook-app-saves-up-to-20-of-android-battery-life
    title: String,
    message: String,
    thumbnailUrl: Option[URI] = None,
    link: URI,
    imageUrl: Option[URI] = None,
    publicationDate: DateTime,
    topics: Set[String] = Set.empty[String],
) {

  def isOfType(alertType: NewsAlertType): Boolean = topics.contains(alertType.toString)

}

object NewsAlertNotification {

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
            case Failure(_)  => error
          }
        case _ => error
      }
    }
  }

  // NewsAlertNotification serializer/deserializer
  implicit val uRIFormats = models.URIFormats.uf
  implicit val jFormat = Json.format[NewsAlertNotification]
}
