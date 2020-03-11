package layout

import common.{Edition, LinkTo}
import conf.switches.Switches
import model.PressedPage
import model.facia.PressedCollection
import model.meta.{ItemList, ListItem}
import model.pressed.{CollectionConfig, PressedContent}
import org.joda.time.DateTime
import play.api.libs.json.Json
import play.api.mvc.RequestHeader
import services.CollectionConfigWithId
import slices.{MostPopular, _}
import views.support.CutOut

import scala.Function._
import scala.annotation.tailrec

case class ContainerLayoutContext(
  cutOutsSeen: Set[CutOut],
  hideCutOuts: Boolean
) {
  def addCutOuts(cutOut: Set[CutOut]): ContainerLayoutContext = copy(cutOutsSeen = cutOutsSeen ++ cutOut)

  type CardAndContext = (ContentCard, ContainerLayoutContext)

  private def dedupCutOut(cardAndContext: CardAndContext): CardAndContext = {
    val (content, context) = cardAndContext

    val maybeSnapType: Option[SnapType] = content.snapStuff.map(_.snapType)
    if (maybeSnapType.contains(FrontendLatestSnap)) {
      (content, context)
    } else {
      val newCard = if (content.cutOut.exists(cutOutsSeen.contains)) {
        content.copy(cutOut = None)
      } else {
        content
      }
      (newCard, context.addCutOuts(content.cutOut.filter(const(content.cardTypes.showCutOut)).toSet))
    }
  }

  private val transforms = Seq(
    dedupCutOut _
  ).reduce(_ compose _)

  def transform(card: FaciaCardAndIndex): (FaciaCardAndIndex, ContainerLayoutContext) = {
    if (hideCutOuts) {
      (card.transformCard(_.copy(cutOut = None)), this)
    } else {
      // Latest snaps are sometimes used to promote journalists, and the cut out should always show on these snaps.
      card.item match {
        case content: ContentCard =>
          val (newCard, newContext) = transforms((content, this))
          (card.copy(item = newCard), newContext)

        case _ => (card, this)
      }
    }
  }
}

object ContainerLayoutContext {
  val empty = ContainerLayoutContext(Set.empty, hideCutOuts = false)
}
