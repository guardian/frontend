package model.dotcomrendering

import play.api.libs.json._

case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[Trail],
)
object OnwardCollectionResponse {
  implicit val collectionWrites: OWrites[OnwardCollectionResponse] = Json.writes[OnwardCollectionResponse]
}

case class OnwardCollectionResponseDCR(
    tabs: Seq[OnwardCollectionResponse],
)
object OnwardCollectionResponseDCR {
  implicit val onwardCollectionResponseForDRCWrites: OWrites[OnwardCollectionResponseDCR] =
    Json.writes[OnwardCollectionResponseDCR]
}

case class MostPopularGeoResponse(
    country: Option[String],
    heading: String,
    trails: Seq[Trail],
)
object MostPopularGeoResponse {
  implicit val popularGeoWrites: OWrites[MostPopularGeoResponse] = Json.writes[MostPopularGeoResponse]
}

case class MostPopularCollectionResponse(heading: String, section: String, trails: Seq[Trail])
object MostPopularCollectionResponse {
  implicit val MostPopularCollectionResponseWrites: OWrites[MostPopularCollectionResponse] =
    Json.writes[MostPopularCollectionResponse]
}
