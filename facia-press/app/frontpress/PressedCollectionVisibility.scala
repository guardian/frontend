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
      lite = pressedCollection.lite(visible),
      full = pressedCollection.full(visible),
      liteAdFree = pressedCollection.adFree.lite(visible),
      fullAdFree = pressedCollection.adFree.full(visible),
      fullDCR = pressedCollection.fullDCR(visible),
    )
  }
}

object PressedCollectionVisibility {
  def isWebCollection(c: PressedCollectionVisibility): Boolean =
    c.pressedCollection.config.platform.isEmpty ||
      c.pressedCollection.config.platform.contains(AnyPlatform) ||
      c.pressedCollection.config.platform.contains(WebCollection)
}
