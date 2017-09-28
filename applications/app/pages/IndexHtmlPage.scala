package pages

import common.Edition
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
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.{devTakeShot, htmlTag}

object IndexHtml {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("facia")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("facia"))))
    override def linkCss: Html = stylesheetLink("stylesheets/facia.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.facia.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.facia.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
  }

  def html( page: IndexPage)(
    headContent: Html = Html(""),
    bodyContent: Html = Html("")
  )(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: IndexPage = page

    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        headContent,
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = defaultBodyClasses)(
        message(),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        guardianHeaderHtml(),
        breakingNewsDiv(),
        bodyContent,
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}

object IndexHtmlPage extends HtmlPage[IndexPage] {
  def html(page: IndexPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html =
    IndexHtml.html(page)(
      headContent = indexHead(page),
      bodyContent = IndexCleaner(page, indexBody(page))
    )
}

object AllIndexHtmlPage extends HtmlPage[IndexPage] {
  def html(page: IndexPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html =
    IndexHtml.html(page)(
      bodyContent = all(page)
    )
}
