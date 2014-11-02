package layout

import views.support.CutOut

import scalaz.Traverse
import scalaz.std.list._
import scalaz.std.option._

/*
░░░░░▄▄▄▄▀▀▀▀▀▀▀▀▄▄▄▄▄▄░░░░░░░
░░░░░█░░░░▒▒▒▒▒▒▒▒▒▒▒▒░░▀▀▄░░░░
░░░░█░░░▒▒▒▒▒▒░░░░░░░░▒▒▒░░█░░░
░░░█░░░░░░▄██▀▄▄░░░░░▄▄▄░░░░█░░
░▄▀▒▄▄▄▒░█▀▀▀▀▄▄█░░░██▄▄█░░░░█░
█░▒█▒▄░▀▄▄▄▀░░░░░░░░█░░░▒▒▒▒▒░█
█░▒█░█▀▄▄░░░░░█▀░░░░▀▄░░▄▀▀▀▄▒█
░█░▀▄░█▄░█▀▄▄░▀░▀▀░▄▄▀░░░░█░░█░
░░█░░░▀▄▀█▄▄░█▀▀▀▄▄▄▄▀▀█▀██░█░░
░░░█░░░░██░░▀█▄▄▄█▄▄█▄████░█░░░
░░░░█░░░░▀▀▄░█░░░█░█▀██████░█░░
░░░░░▀▄░░░░░▀▀▄▄▄█▄█▄█▄█▄▀░░█░░
░░░░░░░▀▄▄░▒▒▒▒░░░░░░░░░░▒░░░█░
░░░░░░░░░░▀▀▄▄░▒▒▒▒▒▒▒▒▒▒░░░░█░
░░░░░░░░░░░░░░▀▄▄▄▄▄░░░░░░░░█░░
*/

object FrontPostProcessing {
  private def setStructure(front: Front, structure: List[Option[List[List[List[Card]]]]]) = {
    front.copy(containers = (front.containers zip structure) map { case (containerAndCollection, structure1) =>
      containerAndCollection.copy(containerLayout = ((containerAndCollection.containerLayout zip structure1) map { case (layout, structure2) =>
        layout.copy(slices = (layout.slices zip structure2) map { case (slices, structure3) =>
          slices.copy(columns = (slices.columns zip structure3) map { case (column, structure4) =>
            column.copy(cards = structure4)
          })
        })
      }).headOption)
    })
  }

  private def getStructure(front: Front): List[Option[List[List[List[Card]]]]] = front.containers.toList.map(
    _.containerLayout.map(
      _.slices.toList.map(
        _.columns.toList.map(_.cards.toList))))

  val layoutStructureTraverse =
    Traverse[List] compose
      Traverse[Option] compose
      Traverse[List] compose
      Traverse[List] compose
      Traverse[List]

  def deduplicateCutouts(front: Front) = {
    val structure = getStructure(front)

    setStructure(front, layoutStructureTraverse.mapAccumL(structure, Set.empty[CutOut]) { (cutOutsSeen, card) =>
      val newCard = if (card.cutOut.exists(cutOutsSeen.contains)) {
        card.copy(cutOut = None)
      } else {
        card
      }

      (cutOutsSeen ++ card.cutOut.toSet, newCard)
    }._2)
  }
}
