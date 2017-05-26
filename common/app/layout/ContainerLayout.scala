package layout

import slices._
import model.pressed.PressedContent
import scala.annotation.tailrec

case class IndexedTrail(faciaContent: PressedContent, index: Int)

object ContainerLayout extends implicits.Collections {
  def apply(
      sliceDefinitions: Seq[Slice],
      items: Seq[PressedContent],
      initialContext: ContainerLayoutContext,
      config: ContainerDisplayConfig,
      mobileShowMore: MobileShowMore
  ): (ContainerLayout, ContainerLayoutContext) = {
    val indexedTrails = items.zipWithIndex.map((IndexedTrail.apply _).tupled)

    val (slices, showMore, finalContext) = sliceDefinitions.foldLeft(
      (Seq.empty[SliceWithCards], indexedTrails, initialContext)
    ) {
      case ((slicesSoFar, Nil, context), _) => (slicesSoFar, Nil, context)
      case ((slicesSoFar, trailsForUse, context), sliceDefinition) =>
        val (slice, remainingTrails, newContext) = SliceWithCards.fromItems(
          trailsForUse,
          sliceDefinition.layout,
          context,
          config.collectionConfigWithId.config,
          mobileShowMore,
          config.showSeriesAndBlogKickers
        )
        (slicesSoFar :+ slice, remainingTrails, newContext)
    }

    (ContainerLayout(slices, showMore map { case IndexedTrail(trail, index) =>
      FaciaCardAndIndex(
        index,
        FaciaCard.fromTrail(
          trail,
          config.collectionConfigWithId.config,
          ItemClasses.showMore,
          config.showSeriesAndBlogKickers
        ),
        hideUpTo = Some(Desktop)
      )
    }), finalContext)
  }

  def singletonFromContainerDefinition(
    containerDefinition: ContainerDefinition,
    config: ContainerDisplayConfig,
    items: Seq[PressedContent]
  ): ContainerLayout = fromContainerDefinition(
    containerDefinition,
    ContainerLayoutContext.empty,
    config,
    items
  )._1

  def fromContainerDefinition(
      containerDefinition: ContainerDefinition,
      containerLayoutContext: ContainerLayoutContext,
      config: ContainerDisplayConfig,
      items: Seq[PressedContent]
  ): (ContainerLayout, ContainerLayoutContext) = apply(
      containerDefinition.slices,
      items,
      containerLayoutContext,
      config,
      containerDefinition.mobileShowMore
    )

  def fromContainer(
      container: Container,
      containerLayoutContext: ContainerLayoutContext,
      config: ContainerDisplayConfig,
      items: Seq[PressedContent]
  ): Option[(ContainerLayout, ContainerLayoutContext)] =
    ContainerDefinition.fromContainer(container, items) map {
      definition: ContainerDefinition =>
        fromContainerDefinition(definition, containerLayoutContext, config, items)
    }

  def forHtmlBlobs(sliceDefinitions: Seq[Slice], blobs: Seq[HtmlAndClasses]): ContainerLayout = {
    val slicesWithItemsCount = (sliceDefinitions zip sliceDefinitions.map(_.layout.columns.map(_.numItems).sum)).toList

    @tailrec
    def slicesWithCards(slices: List[(Slice, Int)],
                        blobs: Seq[HtmlAndClasses],
                        accumulation: Vector[SliceWithCards] = Vector.empty
                       ) : Seq[SliceWithCards] = {
      slices match {
        case Nil => accumulation
        case (slice, numToConsume) :: remainingSlices =>
          val (blobsConsumed, blobsUnconsumed) = blobs.splitAt(numToConsume)
          slicesWithCards(
            remainingSlices,
            blobsUnconsumed,
            accumulation :+ SliceWithCards.fromBlobs(slice.layout, blobsConsumed)
          )
      }
    }

    ContainerLayout(
      slicesWithCards(slicesWithItemsCount, blobs),
      Nil
    )
  }
}

case class ContainerLayout(
  slices: Seq[SliceWithCards],
  remainingCards: Seq[FaciaCardAndIndex]
) {
  def transformCards(f: ContentCard => ContentCard): ContainerLayout = copy(
    slices = slices.map(_.transformCards(f)),
    remainingCards.map(cardAndIndex => cardAndIndex.transformCard(f))
  )

  def hasMobileShowMore: Boolean =
    slices.flatMap(_.columns.flatMap(_.cards)).exists(_.hideUpTo.contains(Mobile))

  def hasDesktopShowMore: Boolean =
    remainingCards.nonEmpty

  def hasShowMore: Boolean = hasDesktopShowMore || hasMobileShowMore
}
