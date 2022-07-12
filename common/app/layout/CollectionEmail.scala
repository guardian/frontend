package layout

import model.PressedPage
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}
import com.gu.commercial.branding.ContainerBranding
import commercial.campaigns.EmailAdvertisements._
import common.Edition

import PartialFunction.condOpt

sealed trait EmailContainer

case class LiveIntentMarquee(newsletterId: String, ids: (String, String, String, String, String)) extends EmailContainer
case class LiveIntentMPU(newsletterId: String, ids: (String, String, String, String, String)) extends EmailContainer
case class LiveIntentSafeRTB(newsletterId: String, ids: List[String]) extends EmailContainer
case class EmailContentContainer(
    displayName: String,
    href: Option[String],
    cards: List[ContentCard],
    config: CollectionConfig,
    collectionType: String,
    branding: Option[ContainerBranding],
    containerId: String,
) extends EmailContainer

object EmailContentContainer {

  def fromPressedCollections(pressedCollections: List[PressedCollection]): List[EmailContentContainer] = {
    pressedCollections
      .map(pressedCollectionToContentContainer)
      .filter(_.cards.nonEmpty)
  }

  private def pressedCollectionToContentContainer(pressedCollection: PressedCollection): EmailContentContainer = {
    val cards = pressedCollection.curatedPlusBackfillDeduplicated.flatMap(contentCard(_, pressedCollection.config))

    /*
        date: 03rd September 2020
        author: Pascal
        message: emailcards was introduced, as a subset of cards, to avoid interactive snaps in
        emails (original request from Celine)
     */
    val emailcards =
      cards.filterNot(_.properties.fold(false)(_.embedType.fold(false)(_ == "interactive")))

    fromCollectionAndCards(pressedCollection, emailcards)
  }

  def storiesCount(collectionConfig: CollectionConfig): Int =
    collectionConfig.displayHints.flatMap(_.maxItemsToDisplay).getOrElse(6)

  private def fromCollectionAndCards(collection: PressedCollection, cards: List[ContentCard]) =
    EmailContentContainer(
      displayName = collection.displayName,
      href = collection.href,
      cards = cards,
      config = collection.config,
      collectionType = collection.collectionType,
      branding = collection.branding(Edition.defaultEdition),
      containerId = collection.id,
    )

  private def contentCard(content: PressedContent, config: CollectionConfig): Option[ContentCard] = {
    condOpt(FaciaCard.fromTrail(content, config, ItemClasses.showMore, showSeriesAndBlogKickers = false)) {
      case card: ContentCard => card
    }
  }
}

object CollectionEmail {
  def fromPressedPage(pressedPage: PressedPage): CollectionEmail =
    CollectionEmail(pressedPage.id, EmailContentContainer.fromPressedCollections(pressedPage.collections))
}

case class CollectionEmail(id: String, contentCollections: List[EmailContentContainer]) {
  def collections: List[EmailContainer] = {
    val (start, end) = contentCollections.splitAt(3)
    List(
      start,
      mpu.get(id).toList,
      end,
      safeRtb.get(id).toList,
    ).flatten
  }
}
