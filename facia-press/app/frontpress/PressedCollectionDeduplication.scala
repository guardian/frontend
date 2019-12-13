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

      Pascal - 13th Dec 2019

      Today I am introducing a logic that is as close to the target logic as possible, while handling two interesting cases:
        1. Maintaining the integrity of the Most Popular container.
        2. Allowing for backfill'ed only containers to work fine.

      Considering the situation:
        - The `PressedCollection`s are given in order `[pc_{1}, pc_{2}, ...., pc_{n-1}, pc_{n}, pc_{n+1}, ... ]`.
        - During the fold we have computed `[pc_{1}, pc_{2}, ...., pc_{n-1}]` and we are given `pc_{n}`.

      Define: `pc_{n}'i` = Deduplication at depth `i` of the backfilled elements of `pc_{n}` using the first `i` curated or backfilled elements of `[pc_{1}, pc_{2}, ...., pc_{n-1}]`

      We compute `pc_{n}'i` for i \in { 1, ...., i_{max} } # Where `i_{max}` the maximum length of the curated or backfilled arrays of the entire collection `[pc_{1}, pc_{2}, ...., pc_{n-1}]`.

      The intuitive meaning of `pc_{n}'i` is that the bigger the `i` the closer we are from the ideal situation of complete deduplication.

      The having been said `pc_{n}'i` with large `i` can lead to Most Popular containers being only partially filled.

      Therefore, once [pc_{n}'1, pc_{n}'2, ..., pc_{n}'i_{max}] has been computed, we take either the first one or the last possible one with at least 10 elements (curated and backfilled counted together).

   */

  def getHeaderURLsFromCuratedAndBackfilledAtDepth(pCVs: Seq[PressedCollectionVisibility], depth: Int): Seq[String] = {
    pCVs.flatMap{ collection => (collection.pressedCollection.curated.take(depth) ++ collection.pressedCollection.backfill.take(depth)).map ( pressedContent => pressedContent.header.url ) }
  }

  def pressedCollectionCommonLength(pC: PressedCollection): Int = pC.curated.size + pC.backfill.size

  def deduplicatedThisCollectionV(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility, depth: Int): PressedCollectionVisibility = {
    val accumulatedHeaderURLsForDeduplication: Seq[String] = getHeaderURLsFromCuratedAndBackfilledAtDepth(accum, depth)
    val newBackfill = collectionV.pressedCollection.backfill.filter( pressedContent => !accumulatedHeaderURLsForDeduplication.contains(pressedContent.header.url) )
    collectionV.copy(
      pressedCollection = collectionV.pressedCollection.copy (
        backfill = newBackfill
      )
    )
  }

  def makeDeduplicatedCollectionCandidates(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility): Seq[PressedCollectionVisibility] = {
    Seq.range(1,10).map{ depth => deduplicatedThisCollectionV(accum, collectionV, depth) }
  }

  def reduceDeduplicatedCollectionCandidates(candidates: Seq[PressedCollectionVisibility]): Option[PressedCollectionVisibility] = {
    candidates.foldLeft[Option[PressedCollectionVisibility]](None){ (accum, collectionV) =>
      accum match {
        case None => Some(collectionV)
        case Some(_collectionV) => Some( if (pressedCollectionCommonLength(collectionV.pressedCollection) >= 10) collectionV else _collectionV )
      }
    }
  }

  def deduplication(pressedCollections: Seq[PressedCollectionVisibility]): Seq[PressedCollectionVisibility] = {
    pressedCollections.foldLeft[Seq[PressedCollectionVisibility]](Nil) { (accum, collectionV) =>
      val candidates: Seq[PressedCollectionVisibility] = makeDeduplicatedCollectionCandidates(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility)
      reduceDeduplicatedCollectionCandidates(candidates) match {
        case None => accum
        case Some(collectionV) => accum :+ collectionV
      }
    }
  }
}
