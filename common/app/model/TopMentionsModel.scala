package model

import common.GuLogging
import model.TopMentionsTopicType.TopMentionsTopicType
import play.api.libs.json.{Format, Json}

case class TopMentionsResult(
    name: String,
    `type`: TopMentionsTopicType,
    blocks: Seq[String],
    count: Int,
    percentage_blocks: Float,
)
case class TopicsDetails(entity_types: Seq[TopMentionsTopicType], results: Seq[TopMentionsResult], model: String)

case class TopMentionJsonParseException(message: String) extends Exception(message)

object TopMentionsResponse {
  implicit val TopMentionsResultJf: Format[TopMentionsResult] = Json.format[TopMentionsResult]
  implicit val TopMentionsDetailsJf: Format[TopicsDetails] = Json.format[TopicsDetails]
}

trait TopicBase {
  def `type`: TopMentionsTopicType
  def value: String
}

case class TopicWithCount(
    `type`: TopMentionsTopicType,
    value: String,
    count: Int,
) extends TopicBase

object TopicWithCount {
  implicit val TopicWithCountJf: Format[TopicWithCount] = Json.format[TopicWithCount]
}

case class Topic(`type`: TopMentionsTopicType, value: String) extends TopicBase

object Topic extends GuLogging {

  implicit val TopicJf: Format[Topic] = Json.format[Topic]

  def fromString(topic: Option[String]): Option[Topic] = {
    topic.flatMap { f =>
      val filterEntity = f.split(":")
      if (filterEntity.length == 2) {
        val entityType = TopMentionsTopicType.withNameOpt(filterEntity(0))
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

object TopMentionsTopicType extends Enumeration {
  type TopMentionsTopicType = Value

  val Org = Value(1, "ORG")
  val Product = Value(2, "PRODUCT")
  val Person = Value(3, "PERSON")
  val Gpe = Value(4, "GPE")
  val WorkOfArt = Value(5, "WORK_OF_ART")
  val Loc = Value(6, "LOC")

  def withNameOpt(s: String): Option[Value] = values.find(_.toString == s.toUpperCase)

  implicit val format: Format[TopMentionsTopicType] = Json.formatEnum(this)
}
