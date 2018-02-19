package frontpress

import layout.slices.Container
import model.PressedCollectionVersions
import model.facia.PressedCollection
import model.pressed.PressedContent
import com.gu.facia.client.models.{AnyPlatform, WebCollection}

case class PressedCollectionVisibility(pressedCollection: PressedCollection, visible: Int) extends implicits.Collections {
  import PressedCollectionVisibility._

  lazy val affectsDuplicates: Boolean = Container.affectsDuplicates(pressedCollection.collectionType)
  lazy val affectedByDuplicates: Boolean = Container.affectedByDuplicates(pressedCollection.collectionType)

  lazy val deduplicateAgainst: Seq[HeaderUrl] = {
    if (affectsDuplicates)
      pressedCollection
        .curatedPlusBackfillDeduplicated
        .take(visible)
        .filter(_.participatesInDeduplication)
        .map(_.header.url)
    else
      Nil
  }

  lazy val pressedCollectionVersions: PressedCollectionVersions = {
    val liteCurated = pressedCollection.curated.take(visible)
    val liteBackfill = pressedCollection.backfill.take(visible - liteCurated.length)
    val hasMore = pressedCollection.curatedPlusBackfillDeduplicated.length > visible
    val liteCollection = pressedCollection.copy(curated = liteCurated, backfill = liteBackfill, hasMore = hasMore)
    val fullCollection = pressedCollection.copy(hasMore = hasMore)
    PressedCollectionVersions(liteCollection, fullCollection)
  }

  def deduplicate(against: Seq[HeaderUrl]): PressedCollectionVisibility = {
    if (affectedByDuplicates) {
      val notDuplicated: Seq[PressedContent] = extractNotDuplicated(against)
      val newCurated = pressedCollection.curated.intersect(notDuplicated)
      val newBackfill = pressedCollection.backfill.intersect(notDuplicated)
      copy(pressedCollection = pressedCollection.copy(curated = newCurated, backfill = newBackfill))
    } else this
  }

  private def extractNotDuplicated(against: Seq[HeaderUrl]): Seq[PressedContent] = {
    pressedCollection
      .curatedPlusBackfillDeduplicated
      .filterNot { content: PressedContent =>
        val againstContainsContent = against.contains(content.header.url)
        againstContainsContent && content.participatesInDeduplication
      }
  }

}

object PressedCollectionVisibility {
  type HeaderUrl = String

  def deduplication(pressedCollections: Seq[PressedCollectionVisibility]): Seq[PressedCollectionVisibility] = {
    pressedCollections.foldLeft[Seq[PressedCollectionVisibility]](Nil) { (accum, collection) =>
      val deduplicateAgainst: Seq[HeaderUrl] = accum.flatMap(_.deduplicateAgainst)
      accum :+ collection.deduplicate(deduplicateAgainst)
    }
  }

  def isWebCollection(c: PressedCollectionVisibility): Boolean =
    c.pressedCollection.config.platform.isEmpty ||
      c.pressedCollection.config.platform.contains(AnyPlatform) ||
      c.pressedCollection.config.platform.contains(WebCollection)
}
