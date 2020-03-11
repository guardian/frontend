package layout

import cards.{MediaList, Standard}
import com.gu.commercial.branding.Branding
import com.gu.contentapi.client.model.{v1 => contentapi}
import com.gu.contentapi.client.utils.{AdvertisementFeature, DesignType}
import common.Edition.defaultEdition
import common.{Edition, LinkTo}
import implicits.FaciaContentFrontendHelpers.FaciaContentFrontendHelper
import model._
import model.pressed._
import org.joda.time.DateTime
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.FaciaContentConvert
import views.support._

import scala.Function.const

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