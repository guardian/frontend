package pages

import conf.switches.Switches.WeAreHiring
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.IndexPage
import views.IndexCleaner
import views.html.all
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head._
import views.html.fragments.page.{devTakeShot, htmlTag}
import html.HtmlPageHelpers.{ContentCSSFile}

object IndexHtml {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles =
    new Styles {
      override def criticalCssLink: Html = criticalStyleLink(FaciaCSSFile)
      override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("facia"))))
      override def linkCss: Html = stylesheetLink(s"stylesheets/$FaciaCSSFile.css")
      override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$FaciaCSSFile.css")
      override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
      override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$FaciaCSSFile.css")
      override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
    }

  def html(page: IndexPage)(
      headContent: Html = Html(""),
      bodyContent: Html = Html(""),
  )(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: IndexPage = page
    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        titleTag(),
        metaData(),
        headContent,
        styles(allStyles),
        fixIEReferenceErrors(),
        checkModuleSupport(),
        inlineJSBlocking(),
      ),
      bodyTag(classes = defaultBodyClasses)(
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkin(request),
        guardianHeaderHtml(),
        mainContent(),
        bodyContent,
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }

}

object IndexHtmlPage extends HtmlPage[IndexPage] {
  def html(page: IndexPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html =
    IndexHtml.html(page)(
      headContent = indexHead(page),
      bodyContent = IndexCleaner(page, indexBody(page)),
    )
}

object AllIndexHtmlPage extends HtmlPage[IndexPage] {
  def html(page: IndexPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html =
    IndexHtml.html(page)(
      bodyContent = all(page),
    )
}
