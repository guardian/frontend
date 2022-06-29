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
case class TopicsApiResponse(entity_types: Seq[TopMentionsTopicType], results: Seq[TopMentionsResult], model: String)

case class TopMentionJsonParseException(message: String) extends Exception(message)

object TopicsApiResponse {
  implicit val TopMentionsResultJf: Format[TopMentionsResult] = Json.format[TopMentionsResult]
  implicit val TopicsApiResponseJf: Format[TopicsApiResponse] = Json.format[TopicsApiResponse]
}

case class AvailableTopic(
    `type`: TopMentionsTopicType,
    value: String,
    count: Int,
)

object AvailableTopic {
  implicit val AvailableTopicJf: Format[AvailableTopic] = Json.format[AvailableTopic]
}

case class SelectedTopic(`type`: TopMentionsTopicType, value: String)

object SelectedTopic extends GuLogging {

  implicit val SelectedTopicJf: Format[SelectedTopic] = Json.format[SelectedTopic]

  def fromString(topic: Option[String]): Option[SelectedTopic] = {
    topic.flatMap { f =>
      val filterEntity = f.split(":")
      if (filterEntity.length == 2) {
        val entityType = TopMentionsTopicType.withNameOpt(filterEntity(0))
        if (entityType.isEmpty) {
          log.warn(s"topics query parameter entity ${filterEntity(0)} is invalid")
          None
        } else {
          log.debug(s"valid topics query parameter - ${f}")
          Some(SelectedTopic(entityType.get, filterEntity(1)))
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
