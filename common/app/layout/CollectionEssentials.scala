package layout

import model.facia.PressedCollection
import model.pressed.{PressedContent}

case class CollectionEssentials(
    items: Seq[PressedContent],
    treats: Seq[PressedContent],
    displayName: Option[String],
    href: Option[String],
    lastUpdated: Option[String],
    showMoreLimit: Option[Int],
)

object CollectionEssentials {
  /* FAPI Integration */

  def fromPressedCollection(collection: PressedCollection): CollectionEssentials =
    CollectionEssentials(
      collection.curatedPlusBackfillDeduplicated,
      collection.treats,
      Option(collection.displayName),
      collection.href,
      collection.lastUpdated.map(_.toString),
      if (collection.curated.isEmpty) Some(9) else None,
    )

  def fromFaciaContent(trails: Seq[PressedContent]): CollectionEssentials =
    CollectionEssentials(
      trails,
      Nil,
      None,
      None,
      None,
      None,
    )

  val empty = CollectionEssentials(Nil, Nil, None, None, None, None)
}
