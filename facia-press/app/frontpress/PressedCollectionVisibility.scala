package frontpress

import model.PressedCollectionVersions
import model.facia.PressedCollection
import com.gu.facia.client.models.{AnyPlatform, WebCollection}

case class PressedCollectionVisibility(pressedCollection: PressedCollection, visible: Int) {
  def withVisible(visible: Int): PressedCollectionVisibility = copy(visible = visible)
  def withoutTrailTextOnTail: PressedCollectionVisibility =
    copy(pressedCollection = pressedCollection.withoutTrailTextOnTail)
  lazy val pressedCollectionVersions: PressedCollectionVersions = {
    PressedCollectionVersions(
      pressedCollection.lite(visible).withDefaultBoostLevels,
      pressedCollection.full(visible).withDefaultBoostLevels,
      pressedCollection.adFree.lite(visible).withDefaultBoostLevels,
      pressedCollection.adFree.full(visible).withDefaultBoostLevels,
    )
  }
}

object PressedCollectionVisibility {
  def isWebCollection(c: PressedCollectionVisibility): Boolean =
    c.pressedCollection.config.platform.isEmpty ||
      c.pressedCollection.config.platform.contains(AnyPlatform) ||
      c.pressedCollection.config.platform.contains(WebCollection)
}
