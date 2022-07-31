package model

import common.Edition
import model.dotcomrendering.OnwardItem
import model.facia.PressedCollection
import play.api.libs.json.Json
import play.api.mvc.RequestHeader

case class OnwardCollection(
    displayName: String,
    heading: String,
    trails: List[OnwardItem],
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
      .map(pressed => OnwardItem.pressedContentToOnwardItem(pressed, edition))

    OnwardCollection(
      displayName = collection.displayName,
      heading = collection.displayName,
      trails = trails,
    )
  }
}
