package services.dotcomponents

import implicits.Requests._
import model.liveblog.{BlockElement, InteractiveBlockElement}
import model.{ArticlePage, PageWithStoryPackage}
import play.api.mvc.RequestHeader

object ArticlePageChecks {

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a: ArticlePage => true
      case _              => false
    }
  }

  def hasOnlySupportedElements(page: PageWithStoryPackage): Boolean = {
    def unsupportedElement(blockElement: BlockElement) =
      blockElement match {
        case InteractiveBlockElement(_, scriptUrl) =>
          scriptUrl match {
            case Some("https://interactive.guim.co.uk/embed/iframe-wrapper/0.1/boot.js") => false
            case _                                                                       => true
          }
        case _ => false
      }

    !page.article.blocks.exists(_.body.exists(_.elements.exists(unsupportedElement)))
  }

  // Custom Tag that can be added to articles while we don't support them
  private[this] val tagsBlockList: Set[String] = Set(
    "tracking/platformfunctional/dcrblacklist",
  )

  def isNotInTagBlockList(page: PageWithStoryPackage): Boolean = {
    !page.item.tags.tags.exists(t => tagsBlockList(t.id))
  }

  def isNotAGallery(page: PageWithStoryPackage): Boolean = !page.item.tags.isGallery

  def isNotLiveBlog(page: PageWithStoryPackage): Boolean = !page.item.tags.isLiveBlog

  def isNotAMP(request: RequestHeader): Boolean = !request.isAmp

}

object ArticlePicker {

  private[this] val logger = DotcomponentsLogger()

  private[this] def logRequest(msg: String, results: Map[String, String], page: PageWithStoryPackage)(implicit
      request: RequestHeader,
  ): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  def dcrChecks(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("hasOnlySupportedElements", ArticlePageChecks.hasOnlySupportedElements(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotInTagBlockList", ArticlePageChecks.isNotInTagBlockList(page)),
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

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {
    val checks = dcrChecks(page, request)
    val dcrCanRender = checks.values.forall(identity)

    val tier =
      if (request.forceDCROff) LocalRenderArticle
      else if (request.forceDCR || dcrCanRender) RemoteRender
      else LocalRenderArticle

    val isArticle100PercentPage = dcrArticle100PercentPage(page, request);
    val pageTones = page.article.tags.tones.map(_.id).mkString(", ")

    // include features that we wish to log but not allow-list against
    val features = checks.mapValues(_.toString) +
      ("isArticle100PercentPage" -> isArticle100PercentPage.toString) +
      ("dcrCouldRender" -> dcrCanRender.toString) +
      ("pageTones" -> pageTones)

    if (tier == RemoteRender) {
      logRequest(s"path executing in dotcomponents", features, page)
    } else {
      logRequest(s"path executing in web", features, page)
    }

    tier
  }
}
