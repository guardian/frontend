package common.commercial

import conf.switches.Switches
import model.ImageOverride
import model.pressed.PressedContent
import views.support.{CardWithSponsorDataAttributes, ImgSrc, SponsorDataAttributes}

case class CardContent(
                        icon: Option[String],
                        headline: String,
                        kicker: Option[String],
                        description: Option[String],
                        imageUrl: Option[String],
                        targetUrl: String,
                        branding: Option[SponsorDataAttributes]
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

    CardContent(
      icon = {
        if (header.isVideo) Some("video-icon")
        else if (header.isGallery) Some("camera")
        else if (header.isAudio) Some("volume-high")
        else None
      },
      headline = header.headline,
      kicker = content.header.kicker flatMap (_.properties.kickerText),
      description = content.card.trailText,
      imageUrl,
      targetUrl = header.url,
      branding = {
        if (Switches.cardsDecidePaidContainerBranding.isSwitchedOn) {
          CardWithSponsorDataAttributes.sponsorDataAttributes(content)
        } else {
          None
        }
      }
    )
  }
}
