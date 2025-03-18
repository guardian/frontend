package services.dotcomrendering

import common.GuLogging
import conf.switches.Switches.DCRCrosswords
import crosswords.CrosswordPageWithContent
import model.Cors.RichRequestHeader
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object CrosswordsPicker extends GuLogging {

  def getTier(
      crosswordPageWithContent: CrosswordPageWithContent,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val dcrShouldRender = DCRCrosswords.isSwitchedOn

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrShouldRender) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(
        s"path executing in dotcomponents",
        Map.empty,
        crosswordPageWithContent.item,
      )
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", Map.empty, crosswordPageWithContent.item)
    }

    tier
  }
}
