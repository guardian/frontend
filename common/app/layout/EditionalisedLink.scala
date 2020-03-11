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

case class EditionalisedLink(
  baseUrl: String
) {
  import common.LinkTo._

  def get(implicit requestHeader: RequestHeader): String =
    LinkTo(baseUrl)(requestHeader)

  def hrefWithRel(implicit requestHeader: RequestHeader): String =
    processUrl(baseUrl, Edition(requestHeader)) match {
      case ProcessedUrl(url, true) => s"""href="$url" rel="nofollow""""
      case ProcessedUrl(url, false) => s"""href="$url""""
    }
}

object EditionalisedLink {
  def fromFaciaContent(faciaContent: PressedContent): EditionalisedLink =
    EditionalisedLink(SupportedUrl.fromFaciaContent(faciaContent))
}

