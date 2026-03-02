package services.dotcomrendering

import com.madgag.scala.collection.decorators.MapDecorator
import implicits.Requests._
import model.{ArticlePage, PageWithStoryPackage}
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger
import implicits.AppsFormat

object ArticlePageChecks {

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a: ArticlePage => true
      case _              => false
    }
  }

  // Treat all hosted content as non-galleries, at least during migration work
  def isNotAGallery(page: PageWithStoryPackage): Boolean = !page.item.tags.isGallery || page.item.content.isHosted

  def isNotPaidContent(page: PageWithStoryPackage): Boolean = !page.item.tags.isPaidContent
}

object ArticlePicker {

  def dcrChecks(page: PageWithStoryPackage): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
    )
  }

  private[this] def dcrArticle100PercentPage(page: PageWithStoryPackage): Boolean = {
    val allowListFeatures = dcrChecks(page)
    val article100PercentPageFeatures = allowListFeatures.view.filterKeys(
      Set(
        "isSupportedType",
        "isNotAGallery",
      ),
    )

    article100PercentPageFeatures.forall({ case (_, isMet) => isMet })
  }

  def getTier(page: PageWithStoryPackage, path: String)(implicit
      request: RequestHeader,
  ): RenderType = {
    val checks = dcrChecks(page)
    val dcrCanRender = checks.values.forall(identity)
    val isNotPaidContent = ArticlePageChecks.isNotPaidContent(page)
    val shouldServePressed = PressedContent.isPressed(ensureStartingForwardSlash(path)) && isNotPaidContent

    val tier: RenderType = decideTier(shouldServePressed, dcrCanRender)

    val isArticle100PercentPage = dcrArticle100PercentPage(page)
    val pageTones = page.article.tags.tones.map(_.id).mkString(", ")

    // include features that we wish to log but not allow-list against
    val features = checks.mapV(_.toString) +
      ("isArticle100PercentPage" -> isArticle100PercentPage.toString) +
      ("dcrCouldRender" -> dcrCanRender.toString) +
      ("pageTones" -> pageTones)

    if (tier == RemoteRender) {
      if (request.getRequestFormat == AppsFormat)
        DotcomponentsLogger.logger.logRequest(
          s"[ArticleRendering] path executing in dotcom rendering for apps (DCAR)",
          features,
          page.article,
        )
      else
        DotcomponentsLogger.logger.logRequest(
          s"[ArticleRendering] path executing in dotcomponents",
          features,
          page.article,
        )
    } else if (tier == PressedArticle) {
      DotcomponentsLogger.logger.logRequest(
        s"[ArticleRendering] path executing from pressed content",
        features,
        page.article,
      )
    } else {
      DotcomponentsLogger.logger.logRequest(
        s"[ArticleRendering] path executing in web (frontend)",
        features,
        page.article,
      )
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
