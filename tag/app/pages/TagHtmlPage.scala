package pages

import common.Edition
import conf.switches.Switches.WeAreHiring
import html.HtmlPageHelpers.{ContentCSSFile, _}
import html.{HtmlPage, Styles}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import services.TagPage
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag, weAreHiring}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.stacked

object TagHtml {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink(FaciaCSSFile)
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("facia"))))
    override def linkCss: Html = stylesheetLink(s"stylesheets/$FaciaCSSFile.css")
    override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$FaciaCSSFile.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
    override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$FaciaCSSFile.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
  }

  def html(page: TagPage)(
    headContent: Html = Html(""),
    bodyContent: Html = Html("")
  )(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: TagPage = page

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
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
        mainContent(),
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

object TagHtmlPage extends HtmlPage[TagPage] {
  def html(page: TagPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html =
    TagHtml.html(page)(
      headContent = tagPageHead(page),
      bodyContent = TagPageCleaner(page, tagPageBody(page))
    )
}

object AllTagHtmlPage extends HtmlPage[TagPage] {
  def html(page: TagPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html =
    TagHtml.html(page)(
      bodyContent = all(page)
    )
}
