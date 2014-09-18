package slices

import common.Seqs._
import slices.Story._

/** Used for calculating the final slice -- any stories that are not standard are considered 'bigs' for the standard
  * slice
  */
private [slices] case class BigsAndStandards(
  bigs: Seq[Story],
  standards: Seq[Story]
)

private [slices] trait DynamicContainer {
  protected def standardSlice(stories: Seq[Story]): Option[Slice]

  private def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val byGroup = segmentByGroup(stories)

    val huges = byGroup.getOrElse(3, Seq.empty)
    val veryBigs = byGroup.getOrElse(2, Seq.empty)

    if (huges.length > 0) {
      Some((Full, stories.drop(1)))
    } else if (veryBigs.length == 1) {
      Some((FullThreeQuarterImage, stories.drop(1)))
    } else if (veryBigs.length >= 2) {
      val storiesInSlice = veryBigs.take(2)

      if (storiesInSlice.map(_.isBoosted).distinct.length == 1) {
        Some((HalfHalf, stories.drop(2)))
      } else if (storiesInSlice(0).isBoosted) {
        Some((ThreeQuarterQuarter, stories.drop(2)))
      } else {
        Some((QuarterThreeQuarter, stories.drop(2)))
      }
    } else {
      None
    }
  }

  protected final def bigsAndStandards(stories: Seq[Story]): BigsAndStandards = {
    val byGroup = segmentByGroup(stories)

    BigsAndStandards(
      bigs = byGroup.getOrElse(3, Seq.empty) ++
        byGroup.getOrElse(2, Seq.empty) ++
        byGroup.getOrElse(1, Seq.empty),
      standards = byGroup.getOrElse(0, Seq.empty)
    )
  }

  final def slicesFor(stories: Seq[Story]): Option[Seq[Slice]] = {
    if (stories.isDescending && stories.forall(story => story.group >= 0 && story.group <= 3)) {
      optionalFirstSlice(stories) map { case (firstSlice, remaining) =>
        Some(Seq(Some(firstSlice), standardSlice(remaining)).flatten)
      } getOrElse {
        standardSlice(stories).map(Seq(_))
      }
    } else {
      None
    }
  }
}
