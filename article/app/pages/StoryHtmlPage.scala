package pages

import common.Edition
import conf.switches.Switches._
import experiments.{ActiveExperiments, OldTLSSupportDeprecation}
import html.HtmlPageHelpers._
import html.Styles
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.{pageSkin, survey}
import views.html.fragments.page._
import views.html.fragments.page.body._
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head._
import html.HtmlPageHelpers.{ContentCSSFile}
import views.html.stacked

object StoryHtmlPage {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink(ContentCSSFile)
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
    override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
    override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
    override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
  }

  def html(
    header: Html,
    content: Html,
    maybeHeadContent: Option[Html] = None
  )(implicit page: Page, request: RequestHeader, applicationContext: ApplicationContext): Html = {

    val head: Html = maybeHeadContent.getOrElse(Html(""))
    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive))
    )

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        titleTag(),
        metaData(),
        head,
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = bodyClasses)(
        tlsWarning() when ActiveExperiments.isParticipating(OldTLSSupportDeprecation),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        survey() when SurveySwitch.isSwitchedOn,
        header,
        mainContent(),
        breakingNewsDiv(),
        content,
        twentyFourSevenTraining(),
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}

