package model

import common.Edition
import model.facia.PressedCollection
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import model.dotcomrendering.{Trail => DCRTrail}

case class OnwardCollection(
    displayName: String,
    heading: String,
    trails: List[DCRTrail],
)

object OnwardCollection {

  implicit def writes = Json.writes[OnwardCollection]

  def pressedCollectionToOnwardCollection(
      collection: PressedCollection,
  )(implicit request: RequestHeader): OnwardCollection = {
    getOnwardCollection(collection, Edition(request))
  }

  def getOnwardCollection(
      collection: PressedCollection,
      edition: Edition,
  ): OnwardCollection = {
    val trails = collection.curatedPlusBackfillDeduplicated
      .take(10)
      .map(pressed => DCRTrail.pressedContentToTrail(pressed, edition))

    OnwardCollection(
      displayName = collection.displayName,
      heading = collection.displayName,
      trails = trails,
    )
  }
}
