package pages

import common.Edition
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{ApplicationContext, SimplePage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.signup.newsletterContent
import conf.switches.Switches.PillarCards

object NewsletterHtmlPage extends HtmlPage[SimplePage] {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("content")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("signup"))))
    override def linkCss: Html = stylesheetLink(s"stylesheets/$pillarCardCSSFileContent.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.content.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$pillarCardCSSFileContent.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.content.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$pillarCardCSSFileContent.css")
  }

  def html(page: SimplePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: SimplePage = page

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
        breakingNewsDiv(),
        newsletterContent(page),
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
