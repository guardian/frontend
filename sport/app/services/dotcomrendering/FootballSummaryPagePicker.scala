package services.dotcomrendering

import conf.switches.Switches.DCRFootballMatchSummary
import football.controllers.FootballPage
import model.Cors.RichRequestHeader
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object FootballSummaryPagePicker {

  def getTier(
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val dcrShouldRender = DCRFootballMatchSummary.isSwitchedOn

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrShouldRender) RemoteRender
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
