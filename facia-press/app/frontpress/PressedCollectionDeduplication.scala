package frontpress

import layout.slices.Container
import model.PressedCollectionVersions
import model.facia.PressedCollection
import model.pressed.PressedContent
import com.gu.facia.client.models.{AnyPlatform, WebCollection}

object PressedCollectionDeduplication {

  /*
      Pascal - 05th Dec 2019

      This object contains the logic for deduplicating a sequence of `PressedCollection`s

      For the moment, due to legacy code, the deduplication is actually done on a sequence of `PressedCollectionVisibility`.
      A refactoring to change this will come change soon.

      As agreed, with Fronts editors and CP, any items that appear in `PressedCollection.curated` is not going to be modified.
      This gives to the users total control over the curation.

      Only elements that appear in `PressedCollection.backfill` can be removed. The rule for removal is simple:

      Considering that the `PressedCollection`s are given in order `[pc_{1}, pc_{2}, ...., pc_{n-1}, pc_{n}, pc_{n+1}, ... ]`,
      then, an element in the `backfill` section of `pc_{n}` will be removed if it appears either in the `curated` or `backfill`
      section of any of [pc_{1}, pc_{2}, ...., pc_{n-1}].

      The attribute of `PressedContent` that we used to detect duplicates is `PressedContent.header.url`
   */

  /*
      Pascal - 20th Dec 2019

      This section presents all exceptions to the above general principle:
          - The Most Popular container is not deduplicated
   */

  def collectionIsMostPopular(collectionV: PressedCollectionVisibility): Boolean = {
    collectionV.pressedCollection.config.collectionType == "news/most-popular"
  }

  def collectionShouldBeDeduplicated(collectionV: PressedCollectionVisibility): Boolean = {
    // For the moment we are only checking if the collection is most popular or not.
    !collectionIsMostPopular(collectionV: PressedCollectionVisibility)
  }

  def getHeaderURLsFromCuratedAndBackfilledAtDepth(pCVs: Seq[PressedCollectionVisibility], depth: Int): Seq[String] = {
    pCVs.flatMap { collection =>
      (collection.pressedCollection.curated ++ collection.pressedCollection.backfill)
        .take(depth)
        .map(pressedContent => pressedContent.header.url)
    }
  }

  def deduplicateCollectionAgainstAccumulator(
      accum: Seq[PressedCollectionVisibility],
      collectionV: PressedCollectionVisibility,
  ): PressedCollectionVisibility = {
    // Essentially deduplicate the backfill of collectionV using header values values from accum's elements curated and backfill
    val accumulatedHeaderURLsForDeduplication: Seq[String] = getHeaderURLsFromCuratedAndBackfilledAtDepth(accum, 10)
    val newBackfill = collectionV.pressedCollection.backfill.filter(pressedContent =>
      !accumulatedHeaderURLsForDeduplication.contains(pressedContent.header.url),
    )
    collectionV.copy(
      pressedCollection = collectionV.pressedCollection.copy(
        backfill = newBackfill,
      ),
    )
  }

  def deduplication(pressedCollections: Seq[PressedCollectionVisibility]): Seq[PressedCollectionVisibility] = {
    pressedCollections.foldLeft[Seq[PressedCollectionVisibility]](Nil) { (accum, collectionV) =>
      if (collectionShouldBeDeduplicated(collectionV: PressedCollectionVisibility)) {
        accum :+ deduplicateCollectionAgainstAccumulator(accum, collectionV)
      } else {
        accum :+ collectionV
      }
    }
  }
}
