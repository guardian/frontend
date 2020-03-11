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

case class DisplaySettings(
  /** TODO check if this should actually be used to determine anything at an item level; if not, remove it */
  isBoosted: Boolean,
  showBoostedHeadline: Boolean,
  showQuotedHeadline: Boolean,
  imageHide: Boolean,
  showLivePlayable: Boolean
)

object DisplaySettings {
  def fromTrail(faciaContent: PressedContent): DisplaySettings = DisplaySettings(
    faciaContent.display.isBoosted,
    faciaContent.display.showBoostedHeadline,
    faciaContent.display.showQuotedHeadline,
    faciaContent.display.imageHide,
    faciaContent.display.showLivePlayable
  )
}
