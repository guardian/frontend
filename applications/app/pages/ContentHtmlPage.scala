package pages

import common.Edition
import controllers.{ImageContentPage, MediaPage, QuizAnswersPage, TodayNewspaper}
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{ApplicationContext, Audio, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head._
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.{newspaperContent, quizAnswerContent}
import html.HtmlPageHelpers.ContentCSSFile
import conf.switches.Switches.WeAreHiring

object ContentHtmlPage extends HtmlPage[Page] {

  def addMerchHighSlot(html: Html, page: Page)(implicit request: RequestHeader, context: ApplicationContext): Html = {
    import views.support.`package`.withJsoup
    import views.support.{BulletCleaner, CommercialComponentHigh}
    val edition = Edition(request)
    withJsoup(BulletCleaner(html.toString))(
      CommercialComponentHigh(
        isPaidContent = false,
        isNetworkFront = false,
        hasPageSkin = page.metadata.hasPageSkin(request),
      ),
    )
  }

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

  def html(page: Page)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: Page = page

    def mediaOrAudioBody(page: MediaPage): Html = {
      page.media match {
        case audio: Audio => audioBody(page, audio)
        case _            => mediaBody(page, displayCaption = false)
      }
    }

    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive)),
    )
    val content: Html = page match {
      case p: ImageContentPage => imageContentBody(p)
      case p: MediaPage        => mediaOrAudioBody(p)
      case p: TodayNewspaper   => newspaperContent(p)
      case p: QuizAnswersPage  => quizAnswerContent(p)
      case unsupported =>
        throw new RuntimeException(
          s"Type of content '${unsupported.getClass.getName}' is not supported by ${this.getClass.getName}",
        )
    }

    val shouldAddMerchSlot: Boolean =
      page.metadata.sectionId == "todayspaper" || page.metadata.sectionId == "theobserver"

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
        guardianHeaderHtml(),
        mainContent(),
        if (shouldAddMerchSlot) addMerchHighSlot(content, page) else content,
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base(),
      ),
      devTakeShot(),
    )
  }

}
