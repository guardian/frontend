package model

import model.TopMentionEntity.TopMentionEntity
import play.api.libs.json.{Format, Json}

case class TopMentionFilters(
    name: String,
    `type`: TopMentionEntity,
    count: Int,
)

object TopMentionFilters {
  implicit val TopMentionJf: Format[TopMentionFilters] = Json.format[TopMentionFilters]
}

case class TopMentionsResult(
    name: String,
    `type`: TopMentionEntity,
    blocks: Seq[String],
    count: Int,
    percentage_blocks: Float,
)
case class TopMentionsDetails(entity_types: Seq[TopMentionEntity], results: Seq[TopMentionsResult], model: String)

case class TopMentionJsonParseException(message: String) extends Exception(message)

object TopMentionsResponse {
  implicit val TopMentionsResultJf: Format[TopMentionsResult] = Json.format[TopMentionsResult]
  implicit val TopMentionsDetailsJf: Format[TopMentionsDetails] = Json.format[TopMentionsDetails]
}

object TopMentionEntity extends Enumeration {
  type TopMentionEntity = Value

  val Org = Value(1, "ORG")
  val Product = Value(2, "PRODUCT")
  val Person = Value(3, "PERSON")
  val Gpe = Value(4, "GPE")
  val WorkOfArt = Value(5, "WORK_OF_ART")
  val Loc = Value(6, "LOC")

  implicit val format: Format[TopMentionEntity] = Json.formatEnum(this)
}
