package layout.slices

import common.Seqs._
import layout.ContainerDisplayConfig
import layout.slices.Story._

private[slices] trait FlexibleContainer {
  protected def standardSlices(stories: Seq[Story], firstSlice: Option[Slice]): Seq[Slice]

  protected def optionalFirstSlice(stories: Seq[Story]): Option[(Slice, Seq[Story])]

  final def slicesFor(stories: Seq[Story], config: ContainerDisplayConfig): Option[Seq[Slice]] = {
    println("slices for stories ", stories)
    println("slices for config", config)
    val flexGenMaxItems = config.collectionConfigWithId.config.displayHints.get.maxItemsToDisplay.getOrElse(20)
    println(s"flexGenMaxItems: $flexGenMaxItems")
    if (stories.nonEmpty && stories.isDescending && stories.forall(story => story.group >= 0 && story.group <= 3)) {
      optionalFirstSlice(stories) map { case (firstSlice, remaining) =>
        val standardSliceSeq = standardSlices(remaining, Some(firstSlice))
        Some(firstSlice +: standardSliceSeq.take(flexGenMaxItems))
      } getOrElse {
        val standardSliceSeq = standardSlices(stories, None)
        Some(standardSliceSeq.take(flexGenMaxItems))
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
