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
                             initialCardContents: Seq[CardContent],
                             extraCardContents: Seq[CardContent]
                           )

case class ContainerMetaData(
                              layoutName: String,
                              hideShowMore: Boolean,
                              sponsorData: Option[SponsorDataAttributes]
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
    val layoutName = collection.collectionType
    val hideShowMore = collection.config.hideShowMore

    val content = {

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
        case _ => cardContents.size
      }

      val extraCardContents = {
        if (hideShowMore) Nil
        else cardContents.drop(maxInitialSize)
      }

      ContainerContent(
        title = collection.displayName,
        description = collection.description,
        targetUrl = collection.href,
        initialCardContents = cardContents.take(maxInitialSize),
        extraCardContents
      )
    }

    val metaData = {

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

      ContainerMetaData(
        layoutName,
        hideShowMore,
        sponsorData
      )
    }

    ContainerModel(id = collection.id, content, metaData)
  }
}
