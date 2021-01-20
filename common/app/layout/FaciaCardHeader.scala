package layout

import model.pressed._

case class FaciaCardHeader(
    quoted: Boolean,
    isExternal: Boolean,
    isVideo: Boolean,
    isGallery: Boolean,
    isAudio: Boolean,
    kicker: Option[ItemKicker],
    headline: String,
    url: EditionalisedLink,
)

object FaciaCardHeader {
  def fromTrail(faciaContent: PressedContent, config: Option[CollectionConfig]): FaciaCardHeader =
    fromTrailAndKicker(
      faciaContent,
      faciaContent.header.kicker,
      config,
    )

  def fromTrailAndKicker(
      faciaContent: PressedContent,
      itemKicker: Option[ItemKicker],
      config: Option[CollectionConfig],
  ): FaciaCardHeader =
    FaciaCardHeader(
      faciaContent.display.showQuotedHeadline,
      faciaContent.card.cardStyle == ExternalLink,
      faciaContent.header.isVideo,
      faciaContent.header.isGallery,
      faciaContent.header.isAudio,
      itemKicker,
      faciaContent.header.headline,
      EditionalisedLink.fromFaciaContent(faciaContent),
    )
}
