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

trait DynamicContainer {
  protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice]

  protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    val byGroup = segmentByGroup(stories)

    val huges = byGroup.getOrElse(3, Seq.empty)
    val veryBigs = byGroup.getOrElse(2, Seq.empty)

    if (huges.length > 0) {
      Some((FullMedia100, stories.drop(1)))
    } else if (veryBigs.length == 1) {
      Some((FullMedia75, stories.drop(1)))
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
    if (stories.nonEmpty && stories.isDescending && stories.forall(story => story.group >= 0 && story.group <= 3)) {
      optionalFirstSlice(stories) map { case (firstSlice, remaining) =>
        Some(firstSlice +: standardSlices(remaining, Some(firstSlice)))
      } getOrElse {
        Some(standardSlices(stories, None))
      }
    } else {
      None
    }
  }

  final def containerDefinitionFor(stories: Seq[Story]): Option[ContainerDefinition] = {
    slicesFor(stories) map { slices =>
      ContainerDefinition(
        slices,
        slicesWithoutMPU = slices,
        mobileShowMore = DesktopBehaviour,
        Set.empty
      )
    }
  }
}
