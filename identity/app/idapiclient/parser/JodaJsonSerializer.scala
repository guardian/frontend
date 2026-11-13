package idapiclient.parser

import org.joda.time.DateTime
import org.json4s.{Formats, MappingException, Serializer, TypeInfo}
import org.json4s.JsonAST.{JString, JValue}
import org.joda.time.format.ISODateTimeFormat

/** ISO 8601 date and time format: 2017-10-16T16:14:23Z
  */
object JodaJsonSerializer extends Serializer[DateTime] {
  private val DateTimeClass = classOf[DateTime]
  val dateTimeFormatISO8601 = ISODateTimeFormat.dateTimeNoMillis

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, JValue), DateTime] = {
    case (TypeInfo(DateTimeClass, _), json) =>
      json match {
        case JString(s) => dateTimeFormatISO8601.parseDateTime(s)
        case x          => throw new MappingException("Can't convert " + x + " to DateTime")
      }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, JValue] = { case dt: DateTime =>
    JString(dateTimeFormatISO8601.print(dt))
  }
}
