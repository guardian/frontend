package layout

import scala.language.higherKinds
import views.support.CutOut
import scala.Function._
import scalaz.Traverse

object CutOutDeduplication {
  def apply[F[_]](container: F[FaciaCard])(implicit traverse: Traverse[F]) = {
    traverse.mapAccumL(container, Set.empty[CutOut]) { (cutOutsSeen, card) =>
      val newCard = if (card.cutOut.exists(cutOutsSeen.contains)) {
        card.copy(cutOut = None)
      } else {
        card
      }

      (cutOutsSeen ++ card.cutOut.filter(const(card.cardTypes.showCutOut)).toSet, newCard)
    }._2
  }
}
