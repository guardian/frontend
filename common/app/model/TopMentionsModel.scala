package model

import common.GuLogging
import model.TopicType.TopicType
import play.api.libs.json.{Format, Json}

case class TopicResult(
    name: String,
    `type`: TopicType,
    blocks: Seq[String],
    count: Int,
    percentage_blocks: Float,
)
case class TopicsApiResponse(entity_types: Seq[TopicType], results: Seq[TopicResult], model: String)

case class TopicsJsonParseException(message: String) extends Exception(message)

object TopicsApiResponse {
  implicit val TopicResultJf: Format[TopicResult] = Json.format[TopicResult]
  implicit val TopicsApiResponseJf: Format[TopicsApiResponse] = Json.format[TopicsApiResponse]
}

case class Topic(
    `type`: TopicType,
    value: String,
    count: Option[Int] = None,
)

object Topic extends GuLogging {
  implicit val TopicJf: Format[Topic] = Json.format[Topic]
  def fromString(topic: Option[String]): Option[Topic] = {
    topic.flatMap { f =>
      val filterEntity = f.split(":")
      if (filterEntity.length == 2) {
        val entityType = TopicType.withNameOpt(filterEntity(0))
        if (entityType.isEmpty) {
          log.warn(s"topics query parameter entity ${filterEntity(0)} is invalid")
          None
        } else {
          log.debug(s"valid topics query parameter - ${f}")
          Some(Topic(entityType.get, filterEntity(1), None))
        }
      } else {
        log.warn(s"topics query parameter is invalid for ${f}, the format is <type>:<name>")
        None
      }
    }
  }
}

object TopicType extends Enumeration {
  type TopicType = Value

  val Org = Value(1, "ORG")
  val Product = Value(2, "PRODUCT")
  val Person = Value(3, "PERSON")
  val Gpe = Value(4, "GPE")
  val WorkOfArt = Value(5, "WORK_OF_ART")
  val Loc = Value(6, "LOC")

  def withNameOpt(s: String): Option[Value] = values.find(_.toString == s.toUpperCase)

  implicit val format: Format[TopicType] = Json.formatEnum(this)
}
