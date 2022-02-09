package services.dotcomponents

import implicits.Requests._
import model.liveblog.{BlockElement, InteractiveBlockElement}
import model.{ArticlePage, PageWithStoryPackage}
import play.api.mvc.RequestHeader
import services.dotcomrendering.PressedContent

object ArticlePageChecks {

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a: ArticlePage => true
      case _              => false
    }
  }

  def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {

    val supportedInteractiveScriptPrefixes: List[String] = List(
      "https://interactive.guim.co.uk/embed/iframe-wrapper/0.1/boot.js", // standard iframe wrapper boot
      "https://open-module.appspot.com/boot.js", // script no longer exists, i.e. parity with frontend
      "https://embed.actionbutton.co/widget/boot.js", // supported in DCR
      "https://interactive.guim.co.uk/2017/07/booklisted/boot.js", // not supported but fallback ok
      "https://interactive.guim.co.uk/page-enhancers/super-lists/boot.js", // broken on frontend anyway
      "https://gdn-cdn.s3.amazonaws.com/quiz-builder/", // old quiz builder quizzes work fine
      "https://uploads.guim.co.uk/2019/03/20/boot.js", //creates a contents section component
      "https://uploads.guim.co.uk/2019/12/11/boot.js", //another variant of the contents block
      "https://interactive.guim.co.uk/page-enhancers/nav/boot.js", //another variant of the contents block
      "https://interactive.guim.co.uk/testing/2020/11/voterSlideshow/boot.js", //why on earth are there so many contents blocks?
      "https://uploads.guim.co.uk/2021/10/15/boot.js", //somehow there are even more
      "https://interactive.guim.co.uk/embed/2018/02/divider/index.html", //A simple divider that renders fine in DCR
    )

    def unsupportedElement(blockElement: BlockElement) =
      blockElement match {
        case InteractiveBlockElement(_, scriptUrl) =>
          scriptUrl match {
            case Some(scriptUrl) if supportedInteractiveScriptPrefixes.exists(scriptUrl.startsWith) => false
            case _                                                                                  => true
          }
        case _ => false
      }

    !page.article.blocks.exists(_.body.exists(_.elements.exists(unsupportedElement)))
  }

  def isNotAGallery(page: PageWithStoryPackage): Boolean = !page.item.tags.isGallery

  def isNotLiveBlog(page: PageWithStoryPackage): Boolean = !page.item.tags.isLiveBlog

  def isNotAMP(request: RequestHeader): Boolean = !request.isAmp

  def isNotPaidContent(page: PageWithStoryPackage): Boolean = !page.item.tags.isPaidContent

}

object ArticlePicker {

  def dcrChecks(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("hasOnlySupportedElements", ArticlePageChecks.hasOnlySupportedElements(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
    )
  }

  private[this] def dcrArticle100PercentPage(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val allowListFeatures = dcrChecks(page, request)
    val article100PercentPageFeatures = allowListFeatures.filterKeys(
      Set(
        "isSupportedType",
        "isNotAGallery",
        "isNotLiveBlog",
        "isNotAMP",
      ),
    )

    article100PercentPageFeatures.forall({ case (_, isMet) => isMet })
  }

  def getTier(page: PageWithStoryPackage, path: String)(implicit
      request: RequestHeader,
  ): RenderType = {
    val checks = dcrChecks(page, request)
    val dcrCanRender = checks.values.forall(identity)
    val isNotPaidContent = ArticlePageChecks.isNotPaidContent(page)
    val shouldServePressed = isNotPaidContent && PressedContent.isPressed(ensureStartingForwardSlash(path))

    val tier: RenderType = decideTier(shouldServePressed, dcrCanRender)

    val isArticle100PercentPage = dcrArticle100PercentPage(page, request);
    val pageTones = page.article.tags.tones.map(_.id).mkString(", ")

    // include features that we wish to log but not allow-list against
    val features = checks.mapValues(_.toString) +
      ("isArticle100PercentPage" -> isArticle100PercentPage.toString) +
      ("dcrCouldRender" -> dcrCanRender.toString) +
      ("pageTones" -> pageTones)

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(s"path executing in dotcomponents", features, page)
    } else if (tier == PressedArticle) {
      DotcomponentsLogger.logger.logRequest(s"path executing from pressed content", features, page)
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", features, page)
    }

    tier
  }

  def decideTier(shouldServePressed: Boolean, dcrCanRender: Boolean)(implicit
      request: RequestHeader,
  ): RenderType = {
    if (request.forceDCROff) LocalRenderArticle
    else if (request.forceDCR) RemoteRender
    else if (shouldServePressed) PressedArticle
    else if (dcrCanRender) RemoteRender
    else LocalRenderArticle
  }

  private def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) "/" + str else str
  }
}
