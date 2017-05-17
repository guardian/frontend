package layout

import conf.switches.Switches
import model.PressedPage
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}
import commercial.campaigns.EmailAdvertisements._

import PartialFunction.condOpt

sealed trait EmailContainer

case class LiveIntentMarquee(newsletterId: String, ids: (String, String, String, String, String)) extends EmailContainer
case class LiveIntentMPU(newsletterId: String, ids: (String, String, String, String, String)) extends EmailContainer
case class LiveIntentSafeRTB(newsletterId: String, ids: List[String]) extends EmailContainer
case class EmailContentContainer(displayName: String, cards: List[ContentCard], config: CollectionConfig, collectionType: String) extends EmailContainer

object EmailContentContainer {

  def fromPressedCollections(pressedCollections: List[PressedCollection]): List[EmailContentContainer] = {
    val (_, reversedContainers) = pressedCollections.foldLeft((List.empty[EditionalisedLink], List.empty[EmailContentContainer])) {
      case ((alreadySeen, emailContainers), pressedCollection) =>
        val cards = collectionCardsDeduplicated(pressedCollection, alreadySeen)
        val emailContainer = fromCollectionAndCards(pressedCollection, cards)
        val newUrls = cards.map(_.header.url)
        (newUrls ::: alreadySeen, emailContainer :: emailContainers)
    }
    reversedContainers.reverse.filter(_.cards.nonEmpty)
  }

  private def collectionCardsDeduplicated(collection: PressedCollection, alreadySeen: List[EditionalisedLink]): List[ContentCard] = {
    val maxItemsToDisplay = collection.config.displayHints.flatMap(_.maxItemsToDisplay).getOrElse(6)
    collection
      .curatedPlusBackfillDeduplicated
      .flatMap(contentCard(_, collection.config))
      .filterNot(content => alreadySeen.contains(content.header.url))
      .take(maxItemsToDisplay)
  }

  private def fromCollectionAndCards(collection: PressedCollection, cards: List[ContentCard]) =
    EmailContentContainer(
      displayName = collection.displayName,
      cards = cards,
      config = collection.config,
      collectionType = collection.collectionType
    )

  private def contentCard(content: PressedContent, config: CollectionConfig): Option[ContentCard] = {
    condOpt(FaciaCard.fromTrail(content, config, ItemClasses.showMore, showSeriesAndBlogKickers = false)) {
      case card: ContentCard => card
    }
  }
}

object CollectionEmail {
  def fromPressedPage(pressedPage: PressedPage) =
    CollectionEmail(pressedPage.id, EmailContentContainer.fromPressedCollections(pressedPage.collections))
}

case class CollectionEmail(id: String, contentCollections: List[EmailContentContainer]) {
  def collections: List[EmailContainer] = {
    if (Switches.guTodayEmailAds.isSwitchedOn) {
      val (start, end) = contentCollections.splitAt(3)
      List(
        start,
        mpu.get(id).toList,
        end,
        safeRtb.get(id).toList
      ).flatten
    } else contentCollections
  }
}
