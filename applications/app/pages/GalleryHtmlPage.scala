package pages

import conf.switches.Switches.WeAreHiring
import html.{HtmlPage, Styles}
import html.HtmlPageHelpers._
import model.{ApplicationContext, GalleryPage, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, skipToMainContent}
import views.html.fragments.page.head._
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.fragments._
import html.HtmlPageHelpers.{ContentCSSFile}

object GalleryHtmlPage extends HtmlPage[GalleryPage] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles =
    new Styles {
      override def criticalCssLink: Html = criticalStyleLink(ContentCSSFile)
      override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
      override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
      override def oldIECriticalCss: Html = stylesheetLink(s"stylesheets/old-ie.head.$ContentCSSFile.css")
      override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
      override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.$ContentCSSFile.css")
      override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
    }

  def html(page: GalleryPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: GalleryPage = page

    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive)),
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
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkin(request),
        galleryTop(),
        galleryBody(page),
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }

}
