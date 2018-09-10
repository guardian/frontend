package idapiclient.parser

import org.joda.time.DateTime
import net.liftweb.json.{Formats, MappingException, Serializer, TypeInfo}
import org.joda.time.format.ISODateTimeFormat
import net.liftweb.json.JsonAST.JString

import scala.util.Try

/**
  * ISO 8601 date and time format: 2017-10-16T16:14:23Z
  */
object JodaJsonSerializer extends Serializer[DateTime]{
  private val DateTimeClass = classOf[DateTime]
  private val dateTimePrinter = ISODateTimeFormat.dateTimeNoMillis
  private val dateTimeParser = ISODateTimeFormat.dateTimeParser()

  def deserialize(implicit format: Formats): PartialFunction[(TypeInfo, _root_.net.liftweb.json.JValue), DateTime] = {
    case (TypeInfo(DateTimeClass, _), json) => json match {
      case JString(s) => Try(dateTimeParser.parseDateTime(s)).getOrElse(
        throw new MappingException("Can't convert " + s + " to DateTime")
      )
      case x => throw new MappingException("Can't convert " + x + " to DateTime")
    }
  }

  def serialize(implicit format: Formats): PartialFunction[Any, _root_.net.liftweb.json.JValue] = {
    case dt: DateTime => JString(dateTimePrinter.print(dt))
  }
}
