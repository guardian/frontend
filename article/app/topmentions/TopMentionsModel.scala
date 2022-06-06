package topmentions

import play.api.libs.json.{Format, Json}

case class TopMentionsResult(name: String, `type`: String, blocks: Seq[String], count: Int, percentage_blocks: Float)
case class TopMentionsDetails(entity_types: Seq[String], results: Seq[TopMentionsResult], model: String)

case class TopMentionJsonParseException(message: String) extends Exception

object TopMentionsResponse {
  implicit val TopMentionsResultJf: Format[TopMentionsResult] = Json.format[TopMentionsResult]
  implicit val TopMentionsDetailsJf: Format[TopMentionsDetails] = Json.format[TopMentionsDetails]
}
