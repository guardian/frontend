package pages

import common.Edition
import controllers.{ImageContentPage, MediaPage, QuizAnswersPage, TodayNewspaper}
import html.HtmlPageHelpers._
import html.{HtmlPage, Styles}
import model.{ApplicationContext, Audio, AudioAsset, Page}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments._
import views.html.fragments.commercial.pageSkin
import views.html.fragments.page.body.{bodyTag, breakingNewsDiv, mainContent, skipToMainContent}
import views.html.fragments.page.head.stylesheets.{criticalStyleInline, criticalStyleLink, styles}
import views.html.fragments.page.head.{fixIEReferenceErrors, headTag, orielScriptTag, titleTag, weAreHiring}
import views.html.fragments.page.{devTakeShot, htmlTag}
import views.html.{newspaperContent, quizAnswerContent}
import html.HtmlPageHelpers.ContentCSSFile
import conf.switches.Switches.WeAreHiring
import experiments.{ActiveExperiments, AudioPageChange, OldTLSSupportDeprecation}

object ContentHtmlPage extends HtmlPage[Page] {

  def allStyles(implicit applicationContext: ApplicationContext, request: RequestHeader): Styles = new Styles {
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

    def mediaOrAudioBody(page: MediaPage): Html  = {
        page.media match {
          case audio: Audio if (ActiveExperiments.isParticipating(AudioPageChange)) => audioBody(page, audio)
          case _ => mediaBody(page, displayCaption = false)
        }
    }

    val bodyClasses: Map[String, Boolean] = defaultBodyClasses() ++ Map(
      ("is-immersive", Page.getContent(page).exists(_.content.isImmersive))
    )
    val content: Html = page match {
      case p: ImageContentPage => imageContentBody(p)
      case p: MediaPage => mediaOrAudioBody(p)
      case p: TodayNewspaper => newspaperContent(p)
      case p: QuizAnswersPage => quizAnswerContent(p)
      case unsupported => throw new RuntimeException(s"Type of content '${unsupported.getClass.getName}' is not supported by ${this.getClass.getName}")
    }

    htmlTag(
      headTag(
        weAreHiring() when WeAreHiring.isSwitchedOn,
        orielScriptTag(),
        titleTag(),
        metaData(),
        styles(allStyles),
        fixIEReferenceErrors(),
        inlineJSBlocking()
      ),
      bodyTag(classes = bodyClasses)(
        tlsWarning() when ActiveExperiments.isParticipating(OldTLSSupportDeprecation),
        skipToMainContent(),
        pageSkin() when page.metadata.hasPageSkinOrAdTestPageSkin(Edition(request)),
        guardianHeaderHtml(),
        mainContent(),
        breakingNewsDiv(),
        content,
        footer(),
        message(),
        inlineJSNonBlocking(),
        analytics.base()
      ),
      devTakeShot()
    )
  }

}
