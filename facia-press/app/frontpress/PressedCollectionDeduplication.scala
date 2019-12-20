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
        The implementation is a variation of the general rules (exposed on 05th Dec 2019) to allow for:
          1. Maintaining the integrity of the Most Popular container.
          2. Allowing for backfill'ed only containers to work fine.
          3. Forcing backfilled deduplication in consecutive containers
   */

  def collectionIsMostPopular(collectionV: PressedCollectionVisibility): Boolean = {
    collectionV.pressedCollection.config.collectionType == "news/most-popular"
  }

  def collectionShouldBeDeduplicated(collectionV: PressedCollectionVisibility): Boolean = {
    // For the moment we are only checking if the collection is most popular or not.
    !collectionIsMostPopular(collectionV: PressedCollectionVisibility)
  }

  def getHeaderURLsFromCuratedAndBackfilledAtDepth(pCVs: Seq[PressedCollectionVisibility], depth: Int): Seq[String] = {
    pCVs.flatMap{ collection => (collection.pressedCollection.curated.take(depth) ++ collection.pressedCollection.backfill.take(depth)).map ( pressedContent => pressedContent.header.url ) }
  }

  def pressedCollectionCommonLength(pC: PressedCollection): Int = pC.curated.size + pC.backfill.size

  def deduplicatedThisCollectionV(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility, depth: Int): PressedCollectionVisibility = {
    // Essentially deduplicate the backfill of collectionV using header values values from accum's elements curated and backfill
    val accumulatedHeaderURLsForDeduplication: Seq[String] = getHeaderURLsFromCuratedAndBackfilledAtDepth(accum, depth)
    val newBackfill = collectionV.pressedCollection.backfill.filter( pressedContent => !accumulatedHeaderURLsForDeduplication.contains(pressedContent.header.url) )
    collectionV.copy(
      pressedCollection = collectionV.pressedCollection.copy (
        backfill = newBackfill
      )
    )
  }

  def makeDeduplicatedCollectionCandidates(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility): Seq[PressedCollectionVisibility] = {
    // Given accum prepare a sequence of more and more aggressively deduplicated versions of collectionV
    val depths: List[Int] = accum.map( c => pressedCollectionCommonLength(c.pressedCollection) ).toList
    val maxDepth = if (depths.isEmpty) 1 else depths.max + 1 // We meed to ensure that maxDepth is at least one for the return Seq to have at least one element
    Seq.range(0, maxDepth).map{ depth => deduplicatedThisCollectionV(accum, collectionV, depth) }
  }

  def secondCollectionShouldBeChosenOverTheFirst(c1: PressedCollectionVisibility, c2: PressedCollectionVisibility): Boolean = {
    pressedCollectionCommonLength(c2.pressedCollection) >= 10
  }

  def reduceDeduplicatedCollectionCandidates(candidates: Seq[PressedCollectionVisibility]): Option[PressedCollectionVisibility] = {
    // Reduces the sequence prepared by makeDeduplicatedCollectionCandidates using the boolean computed by secondCollectionShouldBeChosenOverTheFirst
    candidates.foldLeft[Option[PressedCollectionVisibility]](None){ (accum, collectionV_) =>
      accum match {
        case None => Some(collectionV_)
        case Some(collectionV) => Some( if(secondCollectionShouldBeChosenOverTheFirst(collectionV, collectionV_)) collectionV_ else collectionV )
      }
    }
  }

  def completelyDeduplicateSecondBackfilledAgainstFirstCurated(collectionV1: PressedCollectionVisibility, collectionV2: PressedCollectionVisibility): PressedCollectionVisibility = {
    val accumulatedHeaderURLsForDeduplication = collectionV1.pressedCollection.curated.map ( pressedContent => pressedContent.header.url )
    val newBackfill = collectionV2.pressedCollection.backfill.filter( pressedContent => !accumulatedHeaderURLsForDeduplication.contains(pressedContent.header.url) )
    collectionV2.copy(
      pressedCollection = collectionV2.pressedCollection.copy (
        backfill = newBackfill
      )
    )
  }

  def completelyDeduplicateCollectionAgainstAccumulatorEnding(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility): PressedCollectionVisibility = {
    val last = accum.reverse.headOption
    last match {
      case None => collectionV
      case Some(lastCollectionV) => completelyDeduplicateSecondBackfilledAgainstFirstCurated(lastCollectionV: PressedCollectionVisibility, collectionV: PressedCollectionVisibility)
    }
  }

  def deduplication(pressedCollections: Seq[PressedCollectionVisibility]): Seq[PressedCollectionVisibility] = {
    pressedCollections.foldLeft[Seq[PressedCollectionVisibility]](Nil) { (accum, collectionV) =>
      if (collectionShouldBeDeduplicated(collectionV: PressedCollectionVisibility)) {
        // Given collectionV we compute the candidates for its replacement, then add the best of those candidates (according to reduceDeduplicatedCollectionCandidates) to accum
        val candidates: Seq[PressedCollectionVisibility] = makeDeduplicatedCollectionCandidates(accum: Seq[PressedCollectionVisibility], collectionV: PressedCollectionVisibility)
        reduceDeduplicatedCollectionCandidates(candidates) match {
          case None => accum
          case Some(collectionV) => accum :+ completelyDeduplicateCollectionAgainstAccumulatorEnding(accum, collectionV)
        }
      } else {
        accum :+ collectionV
      }
    }
  }
}
