package topmentions

import play.api.libs.json.{Format, Json}
import topmentions.TopMentionEntity.TopMentionEntity

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

  def withNameOpt(s: String): Option[Value] = values.find(_.toString == s)

  implicit val format: Format[TopMentionEntity] = Json.formatEnum(this)
}
