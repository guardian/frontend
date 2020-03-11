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

sealed trait SnapType

case object FrontendLatestSnap extends SnapType
case object FrontendLinkSnap extends SnapType
case object FrontendOtherSnap extends SnapType
