package services.dotcomrendering

import conf.switches.Switches.DCRFootballPages
import football.controllers.FootballPage
import model.Cors.RichRequestHeader
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object FootballPagePicker {

  def isSupportedInDcr(page: FootballPage): Boolean = {
    val footballMatchesPattern =
      """^football(?:/[^/]+)?/(live|fixtures|results)(?:/more)?(?:/\d{4}/[A-Za-z]{3}/\d{1,2})?$""".r
    footballMatchesPattern.matches(page.metadata.id)
  }

  def getTier(
      footballPage: FootballPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val dcrCanRender = isSupportedInDcr(footballPage)
    val dcrShouldRender = DCRFootballPages.isSwitchedOn

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && dcrShouldRender) RemoteRender
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
