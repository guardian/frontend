package pages

import common.Edition
import html.{HtmlPage, Styles}
import html.HtmlPageHelpers._
import model.{ApplicationContext, PressedPage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.commercial.pageSkin
import views.html.fragments._
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.{devTakeShot, htmlTag}

object FrontHtmlPage extends HtmlPage[PressedPage] {

  def cleanedFrontBody()(implicit page: PressedPage, request: RequestHeader, context: ApplicationContext): Html = {
    import views.support.`package`.withJsoup
    import views.support.{BulletCleaner, CommercialComponentHigh, CommercialMPUForFronts}
    val html: Html = frontBody(page)
    val edition = Edition(request)
    withJsoup(BulletCleaner(html.toString))(
      CommercialComponentHigh(page.frontProperties.isPaidContent, page.isNetworkFront, page.metadata.hasPageSkin(edition)),
      CommercialMPUForFronts(page.isNetworkFront)
    )
  }

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("facia")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("facia"))))
    override def linkCss: Html = stylesheetLink("stylesheets/facia.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.facia.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.facia.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
  }

  def html(page: PressedPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: PressedPage = page
    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        frontMeta(),
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = defaultBodyClasses)(
        message(),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        guardianHeaderHtml(),
        breakingNewsDiv(),
        cleanedFrontBody(),
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
