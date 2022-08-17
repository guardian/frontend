package pages

import conf.switches.Switches.WeAreHiring
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{
  ApplicationContext,
  ContributorsListing,
  PreferencesMetaData,
  StandalonePage,
  SubjectsListing,
  TagIndexPage,
}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head._
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.preferences.index
import html.HtmlPageHelpers.{ContentCSSFile}

object TagIndexHtmlPage extends HtmlPage[StandalonePage] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles =
    new Styles {
      override def criticalCssLink: Html = criticalStyleLink("index")
      override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(Some("index"))))
      override def linkCss: Html = stylesheetLink(s"stylesheets/$ContentCSSFile.css")
      override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.index.css")
      override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$ContentCSSFile.css")
      override def IE9LinkCss: Html = stylesheetLink(s"stylesheets/ie9.head.index.css")
      override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$ContentCSSFile.css")
    }

  def html(page: StandalonePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: StandalonePage = page

    val content: Html = page match {
      case p: TagIndexPage        => tagIndexBody(p)
      case p: PreferencesMetaData => index(p)
      case p: ContributorsListing => tagIndexListingBody("contributors", p.metadata.webTitle, p.listings)
      case p: SubjectsListing     => tagIndexListingBody("subjects", p.metadata.webTitle, p.listings)

      case unsupported =>
        throw new RuntimeException(
          s"Type of content '${unsupported.getClass.getName}' is not supported by ${this.getClass.getName}",
        )
    }

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
      bodyTag(classes = defaultBodyClasses())(
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkin(request),
        guardianHeaderHtml(),
        mainContent(),
        content,
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }

}
