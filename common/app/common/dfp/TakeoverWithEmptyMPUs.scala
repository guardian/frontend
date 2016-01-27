package common.dfp

import common.Edition
import conf.Configuration.commercial._
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import org.joda.time.{DateTime, DateTimeZone}
import play.api.data.Forms._
import play.api.data.format.Formatter
import play.api.data.validation.{Invalid, Valid, Constraint}
import play.api.data.{Form, FormError}
import play.api.libs.functional.syntax._
import play.api.libs.json.Json._
import play.api.libs.json._
import services.S3
import java.net.{MalformedURLException, URL}

case class TakeoverWithEmptyMPUs(url: String,
                                 editions: Seq[Edition],
                                 startTime: DateTime,
                                 endTime: DateTime)

object TakeoverWithEmptyMPUs {

  private val timeJsonFormatter = ISODateTimeFormat.dateTime().withZoneUTC()

  val timeViewFormatter = DateTimeFormat.forPattern("d MMM YYYY HH:mm:ss z").withZoneUTC()

  implicit val writes = new Writes[TakeoverWithEmptyMPUs] {
    def writes(takeover: TakeoverWithEmptyMPUs): JsValue = {
      Json.obj(
        "url" -> takeover.url,
        "editions" -> takeover.editions,
        "startTime" -> timeJsonFormatter.print(takeover.startTime),
        "endTime" -> timeJsonFormatter.print(takeover.endTime)
      )
    }
  }

  val mustBeAtLeastOneDirectoryDeep = Constraint[String] { s: String =>
    try {
      val uri = new URL(s)
      uri.getPath.trim match {
        case "" => Invalid("Must be at least one directory deep. eg: http://www.theguardian.com/us")
        case "/" => Invalid("Must be at least one directory deep. eg: http://www.theguardian.com/us")
        case _ => Valid
      }
    } catch {
      case use: MalformedURLException => Invalid("Must be a valid URL. eg: http://www.theguardian.com/us")
    }
  }

  implicit val reads: Reads[TakeoverWithEmptyMPUs] = (
    (JsPath \ "url").read[String] and
      (JsPath \ "editions").read[Seq[Edition]] and
      (JsPath \ "startTime").read[String].map(timeJsonFormatter.parseDateTime) and
      (JsPath \ "endTime").read[String].map(timeJsonFormatter.parseDateTime)
    )(TakeoverWithEmptyMPUs.apply _)

  implicit val editionFormatter = new Formatter[Edition] {
    override def bind(key: String, data: Map[String, String]): Either[Seq[FormError], Edition] = {
      val editionId = data(key)
      Edition.byId(editionId) map (Right(_)) getOrElse
        Left(Seq(FormError(key, s"No such edition: $key")))
    }
    override def unbind(key: String, value: Edition): Map[String, String] = {
      Map(key -> value.id)
    }
  }

  val form = Form(
    mapping(
      "url" -> nonEmptyText.verifying(mustBeAtLeastOneDirectoryDeep),
      "editions" -> seq(of[Edition]),
      "startTime" -> jodaDate("yyyy-MM-dd'T'HH:mm", DateTimeZone.UTC),
      "endTime" -> jodaDate("yyyy-MM-dd'T'HH:mm", DateTimeZone.UTC)
    )(TakeoverWithEmptyMPUs.apply)(TakeoverWithEmptyMPUs.unapply)
  )

  def fetch(): Seq[TakeoverWithEmptyMPUs] = {
    val takeovers = S3.get(takeoversWithEmptyMPUsKey) map {
      Json.parse(_).as[Seq[TakeoverWithEmptyMPUs]]
    } getOrElse Nil
    takeovers
  }

  def fetchSorted(): Seq[TakeoverWithEmptyMPUs] = {
    fetch() sortBy { takeover =>
      (takeover.url, takeover.startTime.getMillis)
    }
  }

  private def put(takeovers: Seq[TakeoverWithEmptyMPUs]): Unit = {
    val content = Json.stringify(toJson(takeovers))
    S3.putPrivate(takeoversWithEmptyMPUsKey, content, "application/json")
  }

  def create(takeover: TakeoverWithEmptyMPUs): Unit = {
    val takeovers = fetch() :+ takeover
    put(takeovers)
  }

  def remove(url: String): Unit = {
    val takeovers = fetch() filterNot (_.url == url)
    put(takeovers)
  }
}
