package model.dotcomrendering

import com.gu.contentapi.client.utils.format.{ArticleDesign, NewsPillar, StandardDisplay}
import model.ContentFormat
import play.api.libs.json._


case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[Trail],
    // todo: remove default if this pattern is adopted
    onwardsSource: String = "unknown-source", //Option[OnwardSource],
    // todo: remove default if this pattern is adopted
    format: ContentFormat = ContentFormat(design = ArticleDesign, theme = NewsPillar, display = StandardDisplay)
)
object OnwardCollectionResponse {
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
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
