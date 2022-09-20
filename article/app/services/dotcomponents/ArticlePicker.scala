package services.dotcomponents

import com.madgag.scala.collection.decorators.MapDecorator
import conf.switches.Switches.GoogleIndexingTest

import scala.util.hashing.MurmurHash3
import implicits.Requests._
import model.{ArticlePage, PageWithStoryPackage}
import play.api.mvc.RequestHeader
import services.dotcomrendering.PressedContent

import scala.math.BigInt.int2bigInt

object ArticlePageChecks {

  def isSupportedType(page: PageWithStoryPackage): Boolean = {
    page match {
      case a: ArticlePage => true
      case _              => false
    }
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
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
    )
  }

  def shouldForceFrontend(request: RequestHeader): Boolean = {
    val hash = MurmurHash3.stringHash(request.path)
    (hash mod 5) == 0
  }

  private[this] def dcrArticle100PercentPage(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val allowListFeatures = dcrChecks(page, request)
    val article100PercentPageFeatures = allowListFeatures.view.filterKeys(
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
    val shouldServePressed = PressedContent.isPressed(ensureStartingForwardSlash(path)) && isNotPaidContent
    val forceFrontendForGoogleTest = GoogleIndexingTest.isSwitchedOn && shouldForceFrontend(request)

    val tier: RenderType = decideTier(shouldServePressed, dcrCanRender, forceFrontendForGoogleTest)

    val isArticle100PercentPage = dcrArticle100PercentPage(page, request);
    val pageTones = page.article.tags.tones.map(_.id).mkString(", ")

    // include features that we wish to log but not allow-list against
    val features = checks.mapV(_.toString) +
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

  def decideTier(shouldServePressed: Boolean, dcrCanRender: Boolean, forceFrontendForGoogleTest: Boolean)(implicit
      request: RequestHeader,
  ): RenderType = {
    if (request.forceDCROff) LocalRenderArticle
    else if (request.forceDCR) RemoteRender
    else if (shouldServePressed) PressedArticle
    else if (forceFrontendForGoogleTest) LocalRenderArticle
    else if (dcrCanRender) RemoteRender
    else LocalRenderArticle
  }

  private def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) "/" + str else str
  }
}
