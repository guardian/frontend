package services.dotcomrendering

import experiments.{ActiveExperiments, DCRFootballLive}
import football.controllers.FootballPage
import model.Cors.RichRequestHeader
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object FootballPagePicker {

  def isSupportedInDcr(page: FootballPage): Boolean = {
    val liveMatchPattern = """^football(?:/[^/]+)?/live$""".r
    liveMatchPattern.matches(page.metadata.id)
  }

  def getTier(
      footballPage: FootballPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val dcrCanRender = isSupportedInDcr(footballPage)

    val participatingInTest = ActiveExperiments.isParticipating(DCRFootballLive)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && participatingInTest) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequestForNonContentPage(
        s"path executing in dotcomponents",
        Map.empty,
      )
    } else {
      DotcomponentsLogger.logger.logRequestForNonContentPage(s"path executing in web (frontend)", Map.empty)
    }

    tier
  }
}
