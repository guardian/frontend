package pages

import common.Edition
import controllers.InteractivePage
import html.{HtmlPage, Styles}
import html.HtmlPageHelpers._
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.fragments._
import views.html.stacked

object InteractiveHtmlPage extends HtmlPage[InteractivePage] {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = stacked(
      criticalStyleLink("content"),
      criticalStyleLink("interactive")
    )
    override def criticalCssInline: Html = criticalStyleInline(
      Html(common.Assets.css.head(None)),
      Html(common.Assets.css.interactive)
    )
    override def linkCss: Html = stylesheetLink("stylesheets/content.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.content.css")
    override def oldIELinkCss: Html = stylesheetLink("stylesheets/old-ie.content.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.content.css")
    override def IE9CriticalCss: Html = stylesheetLink("stylesheets/ie9.content.css")
  }

  def html(page: InteractivePage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: InteractivePage = page

    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive)),
      ("is-immersive-interactive", Page.getContent(page).exists(content => content.tags.isInteractive && content.content.isImmersive))
    )

    htmlTag(
      headTag(
        titleTag(),
        metaData(),
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = bodyClasses)(
        message(),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        guardianHeaderHtml(),
        breakingNewsDiv(),
        interactiveBody(page),
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
