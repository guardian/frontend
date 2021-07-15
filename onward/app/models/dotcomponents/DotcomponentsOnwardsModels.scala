package models.dotcomponents

import com.gu.contentapi.client.utils.DesignType
import model.{ContentFormat, DotcomContentType, Pillar, ImageAsset}
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

// object OnwardsUtils {

//   def determinePillar(pillar: Option[Pillar]): String = {
//     pillar.map { pillar => correctPillar(pillar.toString.toLowerCase()) }.getOrElse("news")
//   }

//   def correctPillar(pillar: String): String = {
//     if (pillar == "arts") {
//       "culture"
//     } else {
//       pillar
//     }
//   }

// }
