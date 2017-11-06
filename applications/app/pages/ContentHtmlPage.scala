package pages

import common.Edition
import controllers.{ImageContentPage, MediaPage, QuizAnswersPage, TodayNewspaper}
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{ApplicationContext, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, skipToMainContent, mainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, titleTag}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.{newspaperContent, quizAnswerContent}
import html.HtmlPageHelpers.pillarCardCSSFileContent

object ContentHtmlPage extends HtmlPage[Page] {

  def allStyles(implicit applicationContext: ApplicationContext): Styles = new Styles {
    override def criticalCssLink: Html = criticalStyleLink("content")
    override def criticalCssInline: Html = criticalStyleInline(Html(common.Assets.css.head(None)))
    override def linkCss: Html = stylesheetLink(s"stylesheets/$pillarCardCSSFileContent.css")
    override def oldIECriticalCss: Html = stylesheetLink("stylesheets/old-ie.head.content.css")
    override def oldIELinkCss: Html = stylesheetLink(s"stylesheets/old-ie.$pillarCardCSSFileContent.css")
    override def IE9LinkCss: Html = stylesheetLink("stylesheets/ie9.head.content.css")
    override def IE9CriticalCss: Html = stylesheetLink(s"stylesheets/ie9.$pillarCardCSSFileContent.css")
  }

  def html(page: Page)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: Page = page

    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive))
    )
    val content: Html = page match {
      case p: ImageContentPage => imageContentBody(p)
      case p: MediaPage => mediaBody(p, displayCaption = false)
      case p: TodayNewspaper => newspaperContent(p)
      case p: QuizAnswersPage => quizAnswerContent(p)
      case unsupported => throw new RuntimeException(s"Type of content '${unsupported.getClass.getName}' is not supported by ${this.getClass.getName}")
    }

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
        mainContent(),
        breakingNewsDiv(),
        content,
        footer(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
