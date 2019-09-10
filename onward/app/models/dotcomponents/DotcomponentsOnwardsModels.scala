package models.dotcomponents

import model.{DotcomContentType, Pillar, Tag, Tags}
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


  // note: these functions are duplicated in the article service (DotcomponentsDataModel - if duplicating again consider moving to common!)
  def isPaidContent(tags: List[Tag]): Boolean = tags.exists(tag => tag.properties.tagType == "Tone" && tag.id == "tone/advertisement-features")
  def findPillar(pillar: Option[Pillar], tags: List[Tag]): String = {
    pillar.map { pillar =>
      if (isPaidContent(tags)) "labs"
      else if (pillar.toString.toLowerCase == "arts") "culture"
      else pillar.toString.toLowerCase()
    }.getOrElse("news")
  }
}
