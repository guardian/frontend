package pages

import common.Edition
import conf.switches.Switches.WeAreHiring
import experiments.{ActiveExperiments, OldTLSSupportDeprecation}
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{ApplicationContext, SimplePage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag, weAreHiring}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.signup.newsletterContent
import html.HtmlPageHelpers.{ContentCSSFile, SignUpCSSFile}

object NewsletterHtmlPage extends HtmlPage[SimplePage] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink(SignUpCSSFile)
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("signup"))))
    override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
    override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
    override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
  }

  def html(page: SimplePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: SimplePage = page

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        titleTag(),
        metaData(),
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = defaultBodyClasses)(
        tlsWarning() when ActiveExperiments.isParticipating(OldTLSSupportDeprecation),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        guardianHeaderHtml(),
        breakingNewsDiv(),
        newsletterContent(page),
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
