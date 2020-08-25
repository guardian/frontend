package pages

import common.Edition
import conf.switches.Switches.WeAreHiring
import controllers.InteractivePage
import experiments.{ActiveExperiments, OldTLSSupportDeprecation}
import html.{HtmlPage, Styles}
import html.HtmlPageHelpers._
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, mainContent, skipToMainContent}
import views.html.fragments.page.head._
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.fragments._
import views.html.stacked
import html.HtmlPageHelpers.{ContentCSSFile}

object InteractiveHtmlPage extends HtmlPage[InteractivePage] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles =
    new Styles {
      override def criticalCssLink: Html =
        stacked(
          criticalStyleLink(ContentCSSFile),
          criticalStyleLink("interactive"),
        )
      override def criticalCssInline: Html =
        criticalStyleInline(
          Html(common.Assets.css.head(None)),
          Html(common.Assets.css.interactive),
        )
      override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
      override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
      override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
      override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
      override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
    }

  def html(page: InteractivePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: InteractivePage = page

    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive)),
      (
        "is-immersive-interactive",
        Page.getContent(page).exists(content => content.tags.isInteractive && content.content.isImmersive),
      ),
    )

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
      bodyTag(classes = bodyClasses)(
        tlsWarning() when ActiveExperiments.isParticipating(OldTLSSupportDeprecation),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        guardianHeaderHtml(),
        mainContent(),
        breakingNewsDiv(),
        interactiveBody(page),
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }

}
