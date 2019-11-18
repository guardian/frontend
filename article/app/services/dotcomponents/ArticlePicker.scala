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

  def logTierChoice(page: PageWithStoryPackage, tier: RenderType)(implicit request: RequestHeader): Unit = {
    val whitelistFeatures = featureWhitelist(page, request)
    val isCommercialBetaUser = ActiveExperiments.isParticipating(DotcomRenderingAdvertisements)
    val features = whitelistFeatures + ("isCommercialBetaUser" -> isCommercialBetaUser)
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
