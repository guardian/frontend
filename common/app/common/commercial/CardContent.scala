package common.commercial

import common.Edition
import model.pressed.PressedContent
import model.{ContentType, ImageMedia, ImageOverride}
import views.support.ImgSrc

case class CardContent(
                        icon: Option[String],
                        headline: String,
                        kicker: Option[String],
                        description: Option[String],
                        image: Option[ImageMedia],
                        fallbackImageUrl: Option[String],
                        targetUrl: String,
                        branding: Option[Branding]
                      )

object CardContent {

  def fromPressedContent(edition: Edition)(content: PressedContent): CardContent = {

    val header = content.header

    val image = {
      val properties = content.properties
      val maybeContent = properties.maybeContent
      lazy val videoImageMedia = maybeContent flatMap (_.elements.mainVideo.map(_.images))
      lazy val imageOverride = properties.image flatMap ImageOverride.createImageMedia
      lazy val defaultTrailPicture = maybeContent flatMap (_.trail.trailPicture)
      imageOverride.orElse(videoImageMedia).orElse(defaultTrailPicture)
    }

    val fallbackImageUrl = image flatMap ImgSrc.getFallbackUrl

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
      image,
      fallbackImageUrl,
      targetUrl = header.url,
      branding = content.branding(edition)
    )
  }

  def fromContentItem(item: ContentType,
                      edition: Edition,
                      clickMacro: Option[String],
                      withDescription: Boolean): CardContent = {
    val tags = item.tags
    CardContent(
      icon = {
        if (tags.isVideo) Some("video-icon")
        else if (tags.isGallery) Some("camera")
        else if (tags.isAudio) Some("volume-high")
        else None
      },
      headline = item.trail.headline,
      kicker = None,
      description = {
        if (withDescription) item.fields.trailText
        else None
      },
      image = item.trail.trailPicture,
      fallbackImageUrl = item.trail.trailPicture flatMap ImgSrc.getFallbackUrl,
      targetUrl = {
        val url = item.metadata.webUrl
        clickMacro map { cm => s"$cm$url" } getOrElse url
      },
      branding = BrandHunter.findContentBranding(item, edition)
    )
  }
}
