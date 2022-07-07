package pages

import conf.switches.Switches.WeAreHiring
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import crosswords.{
  AccessibleCrosswordPage,
  CrosswordPage,
  CrosswordPageWithSvg,
  CrosswordSearchPageNoResult,
  CrosswordSearchPageWithResults,
}
import views.html.fragments._
import crosswords._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head._
import views.html.fragments.page.{devTakeShot, htmlTag}
import html.HtmlPageHelpers.ContentCSSFile
import views.html.fragments.commercial.survey

object CrosswordHtmlPage extends HtmlPage[CrosswordPage] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles =
    new Styles {
      override def criticalCssLink: Html = criticalStyleLink(ContentCSSFile)
      override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
      override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css", true)
      override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css", true)
      override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css", true)
      override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
      override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css", true)
    }

  def html(page: CrosswordPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: CrosswordPage = page

    val content: Html = page match {
      case p: CrosswordPageWithSvg           => crosswordContent(p)
      case p: AccessibleCrosswordPage        => accessibleCrosswordContent(p)
      case p: CrosswordSearchPageWithResults => crosswordSearch(p)
      case _: CrosswordSearchPageNoResult    => crosswordNoResult()
    }

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        titleTag(),
        metaData(),
        styles(allStyles),
        fixIEReferenceErrors(),
        checkModuleSupport(),
        inlineJSBlocking(),
      ),
      bodyTag(classes = defaultBodyClasses)(
        skipToMainContent(),
        survey(),
        pageSkin() when page.metadata.hasPageSkin(request),
        guardianHeaderHtml(),
        mainContent(),
        content,
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }
}

object PrintableCrosswordHtmlPage extends HtmlPage[CrosswordPageWithSvg] {

  def html(
      page: CrosswordPageWithSvg,
  )(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: CrosswordPageWithSvg = page

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        titleTag(),
        metaData(),
        styles(CrosswordHtmlPage.allStyles),
        fixIEReferenceErrors(),
        checkModuleSupport(),
        inlineJSBlocking(),
      ),
      printableCrosswordBody(),
    )
  }
}
