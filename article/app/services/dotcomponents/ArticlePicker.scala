package services.dotcomponents

import dotcomrendering.DotcomRendering._
import experiments.{ActiveExperiments, DotcomRenderingAdvertisements}
import model.PageWithStoryPackage
import play.api.mvc.RequestHeader

object ArticlePicker {

  val logger = DotcomponentsLogger()

  private[this] def logRequest(msg:String, results: Map[String, Boolean], page: PageWithStoryPackage)(implicit request: RequestHeader): Unit = {
    logger.withRequestHeaders(request).results(msg, results, page)
  }

  private[this] def featureWhitelist(page: PageWithStoryPackage, request: RequestHeader): Map[String, Boolean] = {
    Map(
      ("isSupportedType", ArticlePageChecks.isSupportedType(page)),
      ("hasBlocks", ArticlePageChecks.hasBlocks(page)),
      ("hasOnlySupportedElements", ArticlePageChecks.hasOnlySupportedElements(page)),
      ("hasOnlySupportedMainElements", ArticlePageChecks.hasOnlySupportedMainElements(page)),
      ("isDiscussionDisabled", ArticlePageChecks.isDiscussionDisabled(page)),
      ("isNotImmersive", ArticlePageChecks.isNotImmersive(page)),
      ("isNotLiveBlog", ArticlePageChecks.isNotLiveBlog(page)),
      ("isNotAReview", ArticlePageChecks.isNotAReview(page)),
      ("isNotAGallery", ArticlePageChecks.isNotAGallery(page)),
      ("isNotAMP", ArticlePageChecks.isNotAMP(request)),
      ("isNotOpinionP", ArticlePageChecks.isNotOpinion(page)),
      ("isNotPaidContent", ArticlePageChecks.isNotPaidContent(page)),
      ("isNewsTone", ArticlePageChecks.isNewsTone(page)),
      ("isNotBlackListed", ArticlePageChecks.isNotBlackListed(page)),
      ("mainMediaIsNotShowcase", ArticlePageChecks.mainMediaIsNotShowcase(page))
    )
  }

  def isInWhitelist(path: String): Boolean = {
    // our whitelist is only one article at the moment
    path == "/info/2019/dec/08/migrating-the-guardian-website-to-react";
  }

  def dcrCouldRender(page: PageWithStoryPackage, request: RequestHeader): Boolean = {
    val whitelistFeatures = featureWhitelist(page, request)
    val isSupported = whitelistFeatures.forall({ case (test, isMet) => isMet})

    isSupported
  }

  def dcrShouldRender(request: RequestHeader): Boolean = {
    // dcrShouldRender provides an override to let us force rendering by DCR even
    // when an article is not supportted
    val forceDCR = request.forceDCR

    forceDCR || isInWhitelist(request.path)
  }

  def dcrShouldNotRender(request: RequestHeader): Boolean = {
    val forceDCROff = request.forceDCROff
    val dcrEnabled = conf.switches.Switches.DotcomRendering.isSwitchedOn

    forceDCROff || !dcrEnabled
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {
    val whitelistFeatures = featureWhitelist(page, request)
    val userIsInCohort = ActiveExperiments.isParticipating(DotcomRenderingAdvertisements)

    // Decide if we should render this request with the DCR platform or not
    val tier = if (dcrShouldNotRender(request)) {
      LocalRenderArticle
    } else if (dcrShouldRender(request)) {
      RemoteRender
    } else if (dcrCouldRender(page, request) && userIsInCohort) {
      RemoteRender
    } else {
      LocalRenderArticle
    }

    // include features that we wish to log but not whitelist against
    val features = whitelistFeatures + ("userIsInCohort" -> userIsInCohort)

    if (tier == RemoteRender) {
      logRequest(s"path executing in dotcomponents", features, page)
    } else {
      logRequest(s"path executing in web", features, page)
    }
  }

  def getTier(page: PageWithStoryPackage)(implicit request: RequestHeader): RenderType = {
    val tier = if (pageWithStoryPackageIsDotcomRenderingEligible(page)) RemoteRender else LocalRenderArticle
    logTierChoice(page, tier)
    tier
  }
}
