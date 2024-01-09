package models.dotcomrendering

import model.{ContentFormat, DotcomContentType, ImageAsset}
import play.api.libs.json.Json
import play.api.libs.json.OWrites

// duplicated in dotcomponentsdatamodel
case class RichLinkTag(
    id: String,
    `type`: String,
    title: String,
)

object RichLinkTag {
  implicit val writes: OWrites[RichLinkTag] = Json.writes[RichLinkTag]
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
  implicit val writes: OWrites[RichLink] = Json.writes[RichLink]
}
