package models.dotcomponents

import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import model.{DotcomContentType, Pillar, Tag, Tags}
import play.api.libs.json.Json

case class RichLink(
  tags: List[RichLinkTag],
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

// duplicated in dotcomponentsdatamodel
case class RichLinkTag(
  id: String,
  `type`: String,
  title: String,
)

object RichLinkTag {
  implicit val writes = Json.writes[RichLinkTag]
}

object OnwardsUtils {
  // marker: c76ce0f6-25dc-41b0-bc12-527312b96e21
  def findPillar(pillar: Option[Pillar], designType: Option[DesignType]): String = {
    pillar.map { pillar =>
      if (designType == AdvertisementFeature) "labs"
      else if (pillar.toString.toLowerCase == "arts") "culture"
      else pillar.toString.toLowerCase()
    }.getOrElse("news")
  }
}
