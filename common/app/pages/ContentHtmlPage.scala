package pages

import common.Edition
import conf.switches.Switches.SurveySwitch
import html.Styles
import html.HtmlPageHelpers._
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.commercial.{pageSkin, survey}
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent, twentyFourSevenTraining}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.head.stylesheets.{criticalStyles, styles}
import views.html.fragments.page._
import views.html.fragments._

object ContentHtmlPage {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCss: Html = criticalStyles()
    override def linkCss: Html = stylesheetLink("stylesheets/content.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.content.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.content.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
  }

  def html(header: Html, content: Html)(implicit page: Page, request: RequestHeader, applicationContext: ApplicationContext): Html = {

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

