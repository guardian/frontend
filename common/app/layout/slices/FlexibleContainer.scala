package layout.slices

import common.Seqs._
import layout.slices.Story._

/** Used for calculating the final slice -- any stories that are not standard are considered 'bigs' for the standard
  * slice
  */
private[slices] case class BigsAndStandards(
    bigs: Seq[Story],
    standards: Seq[Story],
)

private[slices] trait FlexibleContainer {
  protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice]

  protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])] = {
    None
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
        Set.empty,
      )
    }
  }
}
