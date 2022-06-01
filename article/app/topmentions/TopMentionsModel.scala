package topmentions

import play.api.libs.json.{Format, Json}

trait TopMentionResponse

case class TopMentionsResult(name: String, `type`: String, blocks: Seq[String], count: Int, percentage_blocks: Float)
case class TopMentionsSuccessResponse(entity_types: Seq[String], results: Seq[TopMentionsResult], model: String)
    extends TopMentionResponse

case class TopMentionsErrorResponse(error: String) extends TopMentionResponse

case class TopMentionJsonParseException(message: String) extends Exception

object TopMentionsResponse {
  implicit val TopMentionsResultJf: Format[TopMentionsResult] = Json.format[TopMentionsResult]
  implicit val TopMentionsSuccessResponseJf: Format[TopMentionsSuccessResponse] =
    Json.format[TopMentionsSuccessResponse]
}
