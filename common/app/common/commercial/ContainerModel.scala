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
