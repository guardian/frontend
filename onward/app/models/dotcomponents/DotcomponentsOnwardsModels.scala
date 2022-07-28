package models.dotcomponents

import model.{ContentFormat, DotcomContentType, ImageAsset}
import play.api.libs.json.Json

// duplicated in dotcomponentsdatamodel
case class RichLinkTag(
    id: String,
    `type`: String,
    title: String,
)

object RichLinkTag {
  implicit val writes = Json.writes[RichLinkTag]
}

case class RichLink(
    tags: List[RichLinkTag],
    cardStyle: String,
    thumbnailUrl: Option[String],
    imageAsset: Option[ImageAsset],
    headline: String,
    contentType: Option[DotcomContentType],
    starRating: Option[Int],
    sponsorName: Option[String],
    contributorImage: Option[String],
    url: String,
    pillar: String,
    format: ContentFormat,
)

object RichLink {
  implicit val writes = Json.writes[RichLink]
}
