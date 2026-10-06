package controllers

import play.api.libs.json.{Json, OFormat}

case class PuzzlesApiItem(
    puzzleId: String,
    puzzleType: String,
    publishDate: String,
    progress: Int,
    setterName: Option[String],
    gameUrl: Option[String],
)

object PuzzlesApiItem {
  implicit val format: OFormat[PuzzlesApiItem] = Json.format[PuzzlesApiItem]
}

case class PuzzlesApiResponse(results: Seq[PuzzlesApiItem])

object PuzzlesApiResponse {
  implicit val format: OFormat[PuzzlesApiResponse] = Json.format[PuzzlesApiResponse]
}
