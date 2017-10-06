package pages

import common.Edition
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import crosswords.{AccessibleCrosswordPage, CrosswordPage, CrosswordPageWithSvg, CrosswordSearchPageNoResult, CrosswordSearchPageWithResults}
import views.html.fragments._
import crosswords.{accessibleCrosswordContent, crosswordContent, crosswordSearch, printableCrosswordBody, crosswordNoResult}
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.{devTakeShot, htmlTag}

object CrosswordHtmlPage extends HtmlPage[CrosswordPage] {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("content")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
    override def linkCss: Html = stylesheetLink("stylesheets/content.css", true)
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.content.css", true)
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css", true)
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.content.css", true)
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css", true)
  }

  def html(page: CrosswordPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: CrosswordPage = page

    val content: Html = page match {
      case p: CrosswordPageWithSvg => crosswordContent(p)
      case p: AccessibleCrosswordPage => accessibleCrosswordContent(p)
      case p: CrosswordSearchPageWithResults => crosswordSearch(p)
      case _: CrosswordSearchPageNoResult => crosswordNoResult()
    }

    htmlTag(
      headTag(
        titleTag(),
        metaData(),
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
        content,
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }
}

object PrintableCrosswordHtmlPage extends HtmlPage[CrosswordPageWithSvg] {

  def html(page: CrosswordPageWithSvg)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: CrosswordPageWithSvg = page

    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        styles(CrosswordHtmlPage.allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      printableCrosswordBody()
    )
  }
}
