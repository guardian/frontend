package layout.slices

import common.Seqs._
import layout.ContainerDisplayConfig
import layout.slices.Story._

private[slices] trait FlexibleContainer {
  protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice], flexGenMaxItems: Int): Seq[Slice]

  protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])]

  final def slicesFor(stories: Seq[Story], config:ContainerDisplayConfig): Option[Seq[Slice]] = {
    val flexGenMaxItems = config.collectionConfigWithId.config.displayHints.get.maxItemsToDisplay.getOrElse(8)
    if (stories.nonEmpty && stories.isDescending && stories.forall(story => story.group >= 0 && story.group <= 3)) {
      optionalFirstSlice(stories) map { case (firstSlice, remaining) =>
        Some(firstSlice +: standardSlices(remaining, Some(firstSlice), flexGenMaxItems))
      } getOrElse {
        Some(standardSlices(stories, None, flexGenMaxItems) )
      }
    } else {
      None
    }
  }

  final def containerDefinitionFor(stories: Seq[Story], config: ContainerDisplayConfig): Option[ContainerDefinition] = {
    slicesFor(stories, config) map { slices =>
      ContainerDefinition(
        slices,
        slicesWithoutMPU = slices,
        mobileShowMore = DesktopBehaviour,
        Set.empty,
      )
    }
  }
}
