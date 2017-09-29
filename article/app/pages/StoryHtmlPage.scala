package pages

import common.Edition
import conf.switches.Switches.SurveySwitch
import html.HtmlPageHelpers._
import html.Styles
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.{pageSkin, survey}
import views.html.fragments.page._
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent, twentyFourSevenTraining}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}

object StoryHtmlPage {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("content")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
    override def linkCss: Html = stylesheetLink("stylesheets/content.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.content.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.content.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
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
        titleTag(),
        metaData(),
        head,
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = bodyClasses)(
        message(),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        survey() when SurveySwitch.isSwitchedOn,
        header,
        breakingNewsDiv(),
        content,
        twentyFourSevenTraining(),
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}

