package layout

import scalaz.Traverse
import scalaz.std.list._
import scalaz.std.option._

object ContainerLayoutPostProcessing {
  type Structure[A] = List[List[List[A]]]

  def setStructure(layout: ContainerLayout, structure: Structure[FaciaCard]) =
    layout.copy(slices = (layout.slices zip structure) map { case (slices, structure3) =>
      slices.copy(columns = (slices.columns zip structure3) map { case (column, structure4) =>
        column.copy(cards = (column.cards zip structure4) map { case (card, faciaCard) =>
          card.copy(item = faciaCard)
        })
      })
    })

  def getStructure(containerLayout: ContainerLayout): Structure[FaciaCard] =
    containerLayout.slices.toList.map(_.columns.toList.map(_.cards.toList.map(_.item)))

  implicit val layoutStructureTraverse = Traverse[List] compose
    Traverse[List] compose
    Traverse[List]

  def deduplicateCutOuts(containerLayout: ContainerLayout): ContainerLayout = {
    setStructure(containerLayout, CutOutDeduplication[Structure](getStructure(containerLayout)))
  }
}
