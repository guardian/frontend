package common.commercial

import common.Edition
import conf.switches.Switches.containerBrandingFromCapi
import model.facia.PressedCollection
import views.support.{Commercial, SponsorDataAttributes}

case class ContainerModel(
                           id: String,
                           layoutName: String,
                           content: ContainerContent,
                           brandingAttributes: Option[SponsorDataAttributes],
                           branding: Option[Branding]
                         ) {
  val isSingleSponsorContainer: Boolean = {
    if (containerBrandingFromCapi.isSwitchedOn) {
      branding.isDefined
    } else brandingAttributes.isDefined
  }
}

case class ContainerContent(
                             title: String,
                             description: Option[String],
                             targetUrl: Option[String],
                             initialCards: Seq[CardContent],
                             showMoreCards: Seq[CardContent]
                           )

object ContainerModel {

  def fromPressedCollection(edition: Edition)(collection: PressedCollection): ContainerModel = {

    val cards = collection.curatedPlusBackfillDeduplicated map CardContent.fromPressedContent(edition)
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

    ContainerModel(
      id = collection.id,
      layoutName,
      content,
      brandingAttributes = Commercial.container.mkSponsorDataAttributes(collection.config),
      branding = collection.branding(edition)
    )
  }
}
