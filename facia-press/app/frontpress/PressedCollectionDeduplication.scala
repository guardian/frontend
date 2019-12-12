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

  def getHeaderURLsFromCuratedAndBackfilled(pCVs: Seq[PressedCollectionVisibility]): Seq[String] = {
    // Return the header urls of all curated or backfill elements of a sequence of `PressedCollectionVisibility`.

    val visibility: Int = 3

    // 11th Dec version:
    // To prevent a tiny problem with the Most Popular container I am introducing the effect of collecting only the
    // first 5 stories of each field. Interestingly the PressedCollectionVisibility has a notion of visibility
    // that is inherited from the old code. The old notion is meant to be decommissioned

    pCVs.flatMap{ collection => (collection.pressedCollection.curated.take(visibility) ++ collection.pressedCollection.backfill.take(visibility)).map ( pressedContent => pressedContent.header.url ) }
  }

  def deduplication(pressedCollections: Seq[PressedCollectionVisibility]): Seq[PressedCollectionVisibility] = {
    pressedCollections.foldLeft[Seq[PressedCollectionVisibility]](Nil) { (accum, collectionV) =>
      val accumulatedHeaderURLsForDeduplication: Seq[String] = getHeaderURLsFromCuratedAndBackfilled(accum)
      // We want to remove from the current collection' backfilled's PressedCollections those with a header that has already been used
      val newBackfill = collectionV.pressedCollection.backfill.filter( pressedContent => !accumulatedHeaderURLsForDeduplication.contains(pressedContent.header.url) )
      val newCollectionV = collectionV.copy(
        pressedCollection = collectionV.pressedCollection.copy (
          backfill = newBackfill
        )
      )
      accum :+ newCollectionV
    }
  }
}
