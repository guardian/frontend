package html

import common.Edition
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.stacked
import views.html.fragments._
import views.html.fragments.page.body._
import views.support.Commercial
import conf.switches.Switches

trait HtmlPage[P <: model.Page] {
  def html(page: P)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html
}

object HtmlPageHelpers {

  implicit class WhenOps(private val html: Html) extends AnyVal {
    def when(condition: => Boolean): Html = if (condition) html else Html("")
  }

  def guardianHeaderHtml()(implicit
      page: model.Page,
      request: RequestHeader,
      applicationContext: ApplicationContext,
  ): Html = {
    val showTop = !page.metadata.shouldHideHeaderAndTopAds
    val showAds =
      Commercial.shouldShowAds(page) && !model.Page.getContent(page).exists(_.tags.isTheMinuteArticle) && !Commercial
        .isAdFree(request)
    val headerContent: Html = stacked(
      commercial.topBanner() when showTop && showAds,
      if (Switches.headerTopNav.isSwitchedOn && !page.metadata.hasSlimHeader) headerTopNav() else header() when showTop,
    )
    bannerAndHeaderDiv(headerContent)
  }

  def defaultBodyClasses()(implicit
      page: model.Page,
      request: RequestHeader,
      applicationContext: ApplicationContext,
  ): Map[String, Boolean] = {
    val edition = Edition(request)
    val showAds =
      Commercial.shouldShowAds(page) && !model.Page.getContent(page).exists(_.tags.isTheMinuteArticle) && !Commercial
        .isAdFree(request)
    Map(
      ("has-page-skin", page.metadata.hasPageSkin(request) && showAds),
      ("has-membership-access-requirement", page.metadata.requiresMembershipAccess),
      ("childrens-books-site", page.metadata.sectionId == "childrens-books-site"),
    )
  }

  def FaciaCSSFile(implicit request: RequestHeader): String = "facia.garnett"
  def ContentCSSFile(implicit request: RequestHeader): String = "content.garnett"
  def RichLinksCSSFile(implicit request: RequestHeader): String = "rich-links.garnett"
  def SignUpCSSFile(implicit request: RequestHeader): String = "signup"
}
