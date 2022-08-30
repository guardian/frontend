package model.dotcomrendering

import common.Edition
import model.facia.PressedCollection
import play.api.libs.json._

case class OnwardCollectionResponse(
    heading: String,
    trails: Seq[Trail],
)
object OnwardCollectionResponse {
  implicit val collectionWrites = Json.writes[OnwardCollectionResponse]
  def getOnwardCollectionResponse(collection: PressedCollection, edition: Edition): OnwardCollectionResponse = {
    val trails = collection.curatedPlusBackfillDeduplicated
      .take(10)
      .map(pressed => Trail.pressedContentToTrail(pressed, edition))

    OnwardCollectionResponse(
      heading = collection.displayName,
      trails = trails,
    )
  }
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

// MostPopularNx2 was introduced to replace the less flexible [common] MostPopular
// which is heavily relying on pressed.PressedContent
// because we want to be able to create MostPopularNx2 from trails coming from the DeeplyReadAgent
case class MostPopularNx2(heading: String, section: String, trails: Seq[Trail])

object MostPopularNx2 {
  implicit val mostPopularNx2Writes = Json.writes[MostPopularNx2]
}
