package layout

import views.support.CutOut

import scalaz.{Lens, Traverse}
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
  val layoutStructureLens = Lens.lensu[Front, List[Option[List[List[List[Card]]]]]](
    set = { (front, structure) =>
      val newContainers = (front.containers zip structure) map { case (containerAndCollection, structure1) =>
        val newLayout = (containerAndCollection.containerLayout zip structure1) map { case (layout, structure2) =>
          val newSlices = (layout.slices zip structure2) map { case (slices, structure3) =>
            val newColumns = (slices.columns zip structure3) map { case (column, structure4) =>
              column.copy(cards = structure4)
            }
            slices.copy(columns = newColumns)
          }
          layout.copy(slices = newSlices)
        }
        containerAndCollection.copy(containerLayout = newLayout.headOption)
      }
      front.copy(containers = newContainers)
    },
    get = { front =>
      front.containers.toList.map(
        _.containerLayout.map(
          _.slices.toList.map(
            _.columns.toList.map(_.cards.toList))))
    }
  )

  val layoutStructureTraverse =
    Traverse[List] compose
      Traverse[Option] compose
      Traverse[List] compose
      Traverse[List] compose
      Traverse[List]

  def deduplicateCutouts(front: Front) = {
    layoutStructureLens.mod({ structure =>
      layoutStructureTraverse.mapAccumL(structure, Set.empty[CutOut]) { (cutOutsSeen, card) =>
        val newCard = if (card.cutOut.exists(cutOutsSeen.contains)) {
          card.copy(cutOut = None)
        } else {
          card
        }

        (cutOutsSeen ++ card.cutOut.toSet, newCard)
      }

      structure
    }, front)
  }
}
