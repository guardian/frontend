package idapiclient.parser

import org.joda.time.DateTime
import net.liftweb.json.{MappingException, TypeInfo, Formats, Serializer}
import org.joda.time.format.ISODateTimeFormat
import net.liftweb.json.JsonAST.JString

/**
  * ISO 8601 date and time format: 2017-10-16T16:14:23Z
  */
object JodaJsonSerializer extends Serializer[DateTime]{
  private val DateTimeClass = classOf[DateTime]
  val dateTimeFormat = ISODateTimeFormat.dateTimeParser().withZoneUTC()

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, _root_.net.liftweb.json.JValue), DateTime] = {
    case (TypeInfo(DateTimeClass, _), json) => json match {
      case JString(s) => dateTimeFormat.parseDateTime(s)
      case x => throw new MappingException("Can't convert " + x + " to DateTime")
    }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, _root_.net.liftweb.json.JValue] = {
    case dt: DateTime => JString(dateTimeFormat.print(dt))
  }
}
