package pages

import experiments.{ActiveExperiments, Garnett}
import html.HtmlPageHelpers._
import html.Styles
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.page._
import views.html.fragments.page.body._
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag, weAreHiring}
import html.HtmlPageHelpers.ContentCSSFile

object IdentityHtmlPage {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("identity")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
    override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
    override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
    override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
  }

  def html(
            content: Html,
            maybeHeadContent: Option[Html] = None
          )(implicit page: Page, request: RequestHeader, applicationContext: ApplicationContext): Html = {

    val head: Html = maybeHeadContent.getOrElse(Html(""))
    val bodyClasses: Map[String, Boolean] = defaultBodyClasses()

    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        head,
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = bodyClasses)(
        skipToMainContent(),
        if(ActiveExperiments.isParticipating(Garnett)) views.html.layout.identityHeader() else guardianHeaderHtml(),
        mainContent(),
        content,
        inlineJSNonBlocking(),
        views.html.layout.identityFooter(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}

