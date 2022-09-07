package model.dotcomrendering

import com.gu.contentapi.client.utils.format.{ArticleDesign, NewsPillar, StandardDisplay}
import model.ContentFormat
import play.api.libs.json._

sealed trait OnwardsSource
object OnwardsSource {
  implicit val writes = Writes[OnwardsSource] {
    case CuratedContent  => JsString("curated-content")
    case MoreOnThisStory => JsString("more-on-this-story")
    case Series          => JsString("series")
    case PopularInTag    => JsString("popular-in-tag")
    case RelatedStories  => JsString("related-stories")
  }

  case object CuratedContent extends OnwardsSource
  case object MoreOnThisStory extends OnwardsSource
  case object Series extends OnwardsSource
  case object PopularInTag extends OnwardsSource
  case object RelatedStories extends OnwardsSource
}

trait OnwardsCollection {
  val heading: String
  val onwardsSource: OnwardsSource
  val format: ContentFormat
}
case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[Trail],
    onwardsSource: OnwardsSource,
    format: ContentFormat,
) extends OnwardsCollection
object OnwardCollectionResponse {
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
}

case class CSROnwardsCollectionResponse(
    heading: String,
    onwardsSource: OnwardsSource,
    format: ContentFormat,
    url: String,
) extends OnwardsCollection
object CSROnwardsCollectionResponse {
  implicit val writes = Json.writes[CSROnwardsCollectionResponse]
}

case class OnwardCollectionResponseDCR(
    tabs: Seq[OnwardCollectionResponse],
    mostCommented: Option[Trail],
    mostShared: Option[Trail],
)
object OnwardCollectionResponseDCR {
  implicit val onwardCollectionResponseForDRCWrites = Json.writes[OnwardCollectionResponseDCR]
}

case class MostPopularGeoResponse(
    country: Option[String],
    heading: String,
    trails: Seq[Trail],
)
object MostPopularGeoResponse {
  implicit val popularGeoWrites = Json.writes[MostPopularGeoResponse]
}

case class MostPopularCollectionResponse(heading: String, section: String, trails: Seq[Trail])
object MostPopularCollectionResponse {
  implicit val MostPopularCollectionResponseWrites = Json.writes[MostPopularCollectionResponse]
}
