package common.commercial

import conf.switches.Switches
import model.ImageOverride
import model.facia.PressedCollection
import model.pressed.PressedContent
import views.support.{CardWithSponsorDataAttributes, Commercial, ImgSrc, SponsorDataAttributes}

case class ContainerModel(
                           id: String,
                           content: ContainerContent,
                           metaData: ContainerMetaData
                         )

case class ContainerContent(
                             title: String,
                             description: Option[String],
                             targetUrl: Option[String],
                             cardContents: Seq[CardContent]
                           )

case class ContainerMetaData(
                              sponsorData: Option[SponsorDataAttributes],
                              layoutName: String,
                              hideShowMore: Boolean
                            )

case class CardContent(
                        headline: String,
                        description: Option[String],
                        imageUrl: Option[String],
                        targetUrl: String,
                        sponsorData: Option[SponsorDataAttributes]
                      )

object CardContent {

  def fromPressedContent(content: PressedContent): CardContent = {

    val header = content.header

    val imageUrl = {
      val properties = content.properties
      val maybeContent = properties.maybeContent
      lazy val videoImageMedia = maybeContent flatMap (_.elements.mainVideo.map(_.images))
      lazy val imageOverride = properties.image flatMap ImageOverride.createImageMedia
      lazy val defaultTrailPicture = maybeContent flatMap (_.trail.trailPicture)
      videoImageMedia.orElse(imageOverride).orElse(defaultTrailPicture) flatMap {
        ImgSrc.getFallbackUrl
      }
    }

    val sponsorData = {
      if (Switches.cardsDecidePaidContainerBranding.isSwitchedOn) {
        CardWithSponsorDataAttributes.sponsorDataAttributes(content)
      } else {
        None
      }
    }

    CardContent(
      headline = header.headline,
      description = content.card.trailText,
      imageUrl,
      targetUrl = header.url,
      sponsorData
    )
  }
}

object ContainerModel {

  def fromPressedCollection(collection: PressedCollection): ContainerModel = {

    val cardContents = collection.curatedPlusBackfillDeduplicated map CardContent.fromPressedContent

    val sponsorData = {
      if (Switches.cardsDecidePaidContainerBranding.isSwitchedOn) {
        val singleSponsorContainer = {
          cardContents.nonEmpty && cardContents.forall(card => card.sponsorData == cardContents.head.sponsorData)
        }
        if (singleSponsorContainer) cardContents.head.sponsorData else None
      } else {
        Commercial.container.mkSponsorDataAttributes(collection.config)
      }
    }

    val content = ContainerContent(
      title = collection.displayName,
      description = collection.description,
      targetUrl = collection.href,
      cardContents
    )

    val metaData = ContainerMetaData(
      sponsorData,
      hideShowMore = collection.config.hideShowMore,
      layoutName = collection.collectionType)

    ContainerModel(id = collection.id, content, metaData)
  }
}
