package pages

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
import html.HtmlPageHelpers.ContentCSSFile

object IdentityHtmlPage {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("identity")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.inlineIdentity))
    override def linkCss: Html = HtmlFormat.fill(List(
      stylesheetLink(s"stylesheets/$ContentCSSFile.css"),
      stylesheetLink(s"stylesheets/membership-icons.css")
    ))
    override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
    override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
  }

  def html(content: Html)
          (implicit page: IdentityPage, request: RequestHeader, applicationContext: ApplicationContext): Html = {

    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = defaultBodyClasses())(
        views.html.layout.identityFlexWrap()(
          skipToMainContent(),
          views.html.layout.identityHeader(hideNavigation=page.isFlow) when page.metadata.hasSlimHeader,
          header() when !page.metadata.hasSlimHeader
        )(
          content
        )(
          inlineJSNonBlocking(),
          views.html.layout.identitySkinnyFooter() when page.isFlow,
          footer() when !page.isFlow,
          analytics.base()
        )
      ),
      devTakeShot()
    )
  }

}

