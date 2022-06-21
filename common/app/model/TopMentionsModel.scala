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
case class TopicsDetails(entity_types: Seq[TopicType], results: Seq[TopicResult], model: String)

case class TopMentionJsonParseException(message: String) extends Exception(message)

object TopicsDetails {
  implicit val TopMentionsResultJf: Format[TopicResult] = Json.format[TopicResult]
  implicit val TopicsDetailsJf: Format[TopicsDetails] = Json.format[TopicsDetails]
}

trait TopicBase {
  def `type`: TopicType
  def value: String
}

case class TopicWithCount(
    `type`: TopicType,
    value: String,
    count: Int,
) extends TopicBase

object TopicWithCount {
  implicit val TopicWithCountJf: Format[TopicWithCount] = Json.format[TopicWithCount]
}

case class Topic(`type`: TopicType, value: String) extends TopicBase

object Topic extends GuLogging {

  implicit val TopMentionsTopicJf: Format[Topic] = Json.format[Topic]

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
          Some(Topic(entityType.get, filterEntity(1)))
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
