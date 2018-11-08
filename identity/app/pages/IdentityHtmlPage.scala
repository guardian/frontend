package pages

import conf.switches.Switches.WeAreHiring
import experiments.{ActiveExperiments, OldTLSSupportDeprecation}
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{ApplicationContext, IdentityPage}
import play.api.mvc.RequestHeader
import play.twirl.api.{Html, HtmlFormat}
import views.html.fragments._
import views.html.fragments.page._
import views.html.fragments.page.body._
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag, weAreHiring}
import html.HtmlPageHelpers.{ContentCSSFile, FooterCSSFile}
import views.html.stacked

object IdentityHtmlPage {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
    override def criticalCssLink: Html = stacked(
      if (conf.switches.Switches.NewNavEnabled.isSwitchedOn) criticalStyleLink("new-identity") else criticalStyleLink("identity"),
      criticalStyleLink(InlineNavigationCSSFile))
    override def criticalCssInline: Html = criticalStyleInline(
      Html(common.Assets.css.inlineIdentity),
      Html(common.Assets.css.inlineNavigation))
    override def linkCss: Html = HtmlFormat.fill(List(
      stylesheetLink(s"stylesheets/$ContentCSSFile.css"),
      stylesheetLink(s"stylesheets/membership-icons.css")
    ))
    override def footerCss: Html = stylesheetLink(s"stylesheets/$FooterCSSFile.css")
    override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
    override def IE9LinkCss: Html = stacked(
      stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css"),
      stylesheetLink(s"stylesheets/head.$InlineNavigationCSSFile.css")
    )
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
  }

  def html(content: Html)
          (implicit page: IdentityPage, request: RequestHeader, applicationContext: ApplicationContext): Html = {

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        titleTag(),
        metaData(),
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = defaultBodyClasses())(
        views.html.layout.identityFlexWrap(page.isFlow)(
          tlsWarning() when ActiveExperiments.isParticipating(OldTLSSupportDeprecation),
          skipToMainContent(),
          views.html.layout.identityHeader(hideNavigation=page.isFlow) when !page.usesGuardianHeader,
          header() when page.usesGuardianHeader
        )(
          content
        )(
          inlineJSNonBlocking(),
          views.html.layout.identitySkinnyFooter() when page.isFlow,
          footer() when !page.isFlow,
          analytics.google(page)
        )
      ),
      devTakeShot()
    )
  }

}

