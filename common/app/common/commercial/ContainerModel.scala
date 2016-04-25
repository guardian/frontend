package common.commercial

import conf.switches.Switches
import model.facia.PressedCollection
import views.support.{Commercial, SponsorDataAttributes}

case class ContainerModel(
                           id: String,
                           layoutName: String,
                           content: ContainerContent,
                           branding: Option[SponsorDataAttributes]
                         ){
  val isSingleSponsorContainer: Boolean = branding.isDefined
}

case class ContainerContent(
                             title: String,
                             description: Option[String],
                             targetUrl: Option[String],
                             initialCards: Seq[CardContent],
                             showMoreCards: Seq[CardContent]
                           )

object ContainerModel {

  def fromPressedCollection(collection: PressedCollection): ContainerModel = {

    val cards = collection.curatedPlusBackfillDeduplicated map CardContent.fromPressedContent
    val layoutName = collection.collectionType

    val content = {

      val title = collection.displayName
      val description = collection.description
      val targetUrl = collection.href

      def mkFixedContainerContent(): ContainerContent = {

        val maxInitialSize = layoutName match {
          case "fixed/large/slow-XIV" => 6
          case "fixed/medium/fast-XI" => 3
          case "fixed/medium/fast-XII" => 4
          case "fixed/medium/slow-VI" => 6
          case "fixed/medium/slow-VII" => 7
          case "fixed/small/fast-VIII" => 8
          case "fixed/small/slow-I" => 1
          case "fixed/small/slow-III" => 3
          case "fixed/small/slow-IV" => 4
          case "fixed/small/slow-V-half" => 5
          case "fixed/small/slow-V-third" => 5
          case _ => cards.size
        }

        ContainerContent(
          title,
          description,
          targetUrl,
          initialCards = cards.take(maxInitialSize),
          showMoreCards = {
            if (collection.config.hideShowMore) Nil
            else cards.drop(maxInitialSize)
          }
        )
      }

      def mkDynamicContainerContent(): ContainerContent = {

        def take(choice: List[CardContent], nextGroup: Option[DynamicGroup], maxCount: Int): List[CardContent] = {
          choice takeWhile(_.group != nextGroup) take maxCount
        }

        case class MaxCardCount(huge: Int, veryBig: Int, big: Int)

        val maxCardCount: MaxCardCount = layoutName match {
          case "dynamic/fast" => MaxCardCount(1, 4, 0)
          case "dynamic/slow" => MaxCardCount(0, 0, 8)
          case "dynamic/package" => MaxCardCount(1, 2, 0)
          case _ => MaxCardCount(0, 0, 0)
        }

        val hugeCards = take(cards, nextGroup = Some(VeryBigGroup), maxCardCount.huge)
        val veryBigCards = take(cards drop hugeCards.size, nextGroup = Some(BigGroup), maxCardCount.veryBig)
        val bigCards = take(cards drop (hugeCards.size + veryBigCards.size), nextGroup = None, maxCardCount.big)

        ContainerContent(
          title,
          description,
          targetUrl,
          initialCards = Nil,
          showMoreCards = {
            if (collection.config.hideShowMore) Nil
            else cards drop (hugeCards.size + veryBigCards.size + bigCards.size)
          }
        )
      }

      if (layoutName startsWith "fixed/") {
        mkFixedContainerContent()
      } else {
        mkDynamicContainerContent()
      }
    }

    val branding = {
      if (Switches.cardsDecidePaidContainerBranding.isSwitchedOn) {
        val singleSponsorContainer = {
          cards.nonEmpty && cards.forall(card => card.branding == cards.head.branding)
        }
        if (singleSponsorContainer) cards.head.branding else None
      } else {
        Commercial.container.mkSponsorDataAttributes(collection.config)
      }
    }

    ContainerModel(
      id = collection.id,
      layoutName,
      content,
      branding
    )
  }
}
