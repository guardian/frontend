package pages

import conf.switches.Switches.WeAreHiring
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.ApplicationContext
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head._
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.signup.newsletterContent
import html.HtmlPageHelpers.ContentCSSFile
import staticpages.NewsletterRoundupPage

object NewsletterHtmlPage extends HtmlPage[NewsletterRoundupPage] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles =
    new Styles {
      override def criticalCssLink: Html = criticalStyleLink(SignUpCSSFile)
      override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("signup"))))
      override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
      override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
      override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
      override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
      override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
    }

  def html(page: NewsletterRoundupPage)(implicit
      request: RequestHeader,
      applicationContext: ApplicationContext,
  ): Html = {
    implicit val p: NewsletterRoundupPage = page

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
        pageSkin() when page.metadata.hasPageSkin(request),
        guardianHeaderHtml(),
        mainContent(),
        newsletterContent(page),
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }

}
