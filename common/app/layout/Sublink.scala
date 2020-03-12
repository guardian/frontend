package layout

import com.gu.contentapi.client.utils.{DesignType}
import model._
import model.pressed._

case class Sublink(
  kicker: Option[ItemKicker],
  headline: String,
  url: EditionalisedLink,
  cardStyle: CardStyle,
  mediaType: Option[MediaType],
  pillar: Option[Pillar],
  contentType: DotcomContentType,
  designType: Option[DesignType],
)

object Sublink {
  def fromFaciaContent(faciaContent: PressedContent): Sublink = {
    val storyContent: Option[PressedStory] = faciaContent.properties.maybeContent
    val contentType: DotcomContentType = DotcomContentType(storyContent)

    Sublink(
      faciaContent.header.kicker,
      faciaContent.header.headline,
      EditionalisedLink.fromFaciaContent(faciaContent),
      faciaContent.card.cardStyle,
      faciaContent.card.mediaType,
      Pillar(storyContent),
      contentType,
      storyContent.map(_.metadata.designType),
    )
  }
}
