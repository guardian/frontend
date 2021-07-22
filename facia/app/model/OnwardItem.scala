package model

import com.github.nscala_time.time.Imports.DateTimeZone
import common.{Edition, LinkTo}
import model.facia.PressedCollection
import model.pressed.PressedContent
import play.api.libs.json.Json
import views.support.{ImageProfile, ImgSrc, Item300, Item460, RemoveOuterParaHtml}
import implicits.FaciaContentFrontendHelpers._
import play.api.mvc.RequestHeader
import model.dotcomrendering.OnwardItem

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
    val trails = collection.curatedPlusBackfillDeduplicated
      .take(10)
      .map(pressed => OnwardItem.pressedContentToOnwardItem(pressed))

    OnwardCollection(
      displayName = collection.displayName,
      heading = collection.displayName,
      trails = trails,
    )
  }
}
