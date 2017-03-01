package layout

import model.PressedPage
import model.facia.PressedCollection
import model.pressed.{CollectionConfig, PressedContent}

import PartialFunction.condOpt

object EmailContainer {

  def fromPressedCollections(pressedCollections: List[PressedCollection]): List[EmailContainer] = {
    val (_, reversedContainers) = pressedCollections.foldLeft((List.empty[EditionalisedLink], List.empty[EmailContainer])) {
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
    EmailContainer(
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

case class EmailContainer(displayName: String, cards: List[ContentCard], config: CollectionConfig, collectionType: String)

object CollectionEmail {
  def fromPressedPage(pressedPage: PressedPage) =
    CollectionEmail(EmailContainer.fromPressedCollections(pressedPage.collections))
}

case class CollectionEmail(collections: List[EmailContainer])
