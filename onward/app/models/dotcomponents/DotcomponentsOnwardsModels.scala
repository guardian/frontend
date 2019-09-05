package models.dotcomponents

import model.{DotcomContentType, Tag, Tags}
import play.api.libs.json.Json

case class RichLink(
  tags: List[Tag],
  cardStyle: String,
  thumbnailUrl: Option[String],
  headline: String,
  contentType: Option[DotcomContentType],
  starRating: Option[Int],
  sponsorName: Option[String],
  contributorImage: Option[String],
  url: String,
  pillar: String
)

object RichLink {
  implicit val writes = Json.writes[RichLink]
}
