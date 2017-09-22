package html

import common.{Edition, Navigation}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.stacked
import views.html.fragments._
import views.html.fragments.page.body._
import views.support.Commercial

object HtmlPageHelpers {
  implicit class WhenOps(private val html: Html) extends AnyVal {
    def when(condition: => Boolean): Html = if(condition) html else Html("")
  }
}

trait HtmlPage[P <: model.Page] {

  import HtmlPageHelpers._

  def html(page: P)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html

  def guardianHeaderHtml()(implicit page: P, request: RequestHeader, applicationContext: ApplicationContext): Html = {
    val showTop = !page.metadata.shouldHideHeaderAndTopAds
    val showAds = Commercial.shouldShowAds(page) && !model.Page.getContent(page).exists(_.tags.isTheMinuteArticle) && !Commercial.isAdFree(request)

    val headerContent: Html = stacked(
      Seq(
        commercial.topBanner() when showTop && showAds,
        header() when showTop
      )
    )
    if(model.Page.getContent(page).exists(_.tags.hasSuperStickyBanner)) bannerAndHeaderDiv(headerContent) else headerContent
  }

  def defaultBodyClasses()(implicit page: P, request: RequestHeader, applicationContext: ApplicationContext): Map[String, Boolean] = {
    val edition = Edition(request)
    Map(
      ("has-page-skin", page.metadata.hasPageSkin(edition)),
      ("has-localnav", Navigation.topLevelItem(edition.navigation, page).filter(_.links.nonEmpty).nonEmpty),
      ("has-membership-access-requirement", page.metadata.requiresMembershipAccess),
      ("childrens-books-site", page.metadata.sectionId == "childrens-books-site"),
      ("has-super-sticky-banner", model.Page.getContent(page).exists(_.tags.hasSuperStickyBanner))
    )
  }


}
