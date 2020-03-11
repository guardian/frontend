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

case class Byline(
  get: String,
  contributorTags: Seq[model.Tag]
) {
  private def primaryContributor = {
    if (contributorTags.length > 2) {
      contributorTags.sortBy({ tag =>
        get.indexOf(tag.metadata.webTitle) match {
          case -1 => Int.MaxValue
          case n => n
        }
      }).headOption
    } else {
      None
    }
  }

  def shortByline: String = primaryContributor map { tag => s"${tag.metadata.webTitle} and others" } getOrElse get
}
