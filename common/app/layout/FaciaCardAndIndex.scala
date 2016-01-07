package layout

import model.pressed.{PressedContent, CollectionConfig}

object FaciaCardAndIndex {
  /** If creating a Card off the cuff (i.e., outside of the normal Facia front construction code */
  def fromTrail(faciaContent: PressedContent, itemClasses: ItemClasses, index: Int) = FaciaCardAndIndex(
    index,
    FaciaCard.fromTrail(
      faciaContent,
      CollectionConfig.empty,
      itemClasses,
      showSeriesAndBlogKickers = false
    ),
    None
  )
}

case class FaciaCardAndIndex(
  index: Int,
  item: FaciaCard,
  hideUpTo: Option[Breakpoint]
) {
  def cssClasses = hideUpTo match {
    case Some(Mobile) => "fc-show-more--hide-on-mobile js-hide-on-mobile"
    case Some(Desktop) => "fc-show-more--hide js-hide"
    case _ => ""
  }

  def visibilityDataAttribute = hideUpTo match {
    case Some(Mobile) => "desktop"
    case Some(Desktop) => "hidden"
    case _ => "all"
  }

  def transformCard(f: ContentCard => ContentCard) = copy(item = item match {
    case content: ContentCard => f(content)
    case other => other
  })
}
