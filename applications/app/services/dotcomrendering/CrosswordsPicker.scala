package services.dotcomrendering

import common.GuLogging
import crosswords.CrosswordPageWithContent
import experiments.{ActiveExperiments, DCRCrosswords}
import model.Cors.RichRequestHeader
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object CrosswordsPicker extends GuLogging {

  def getTier(
      crosswordPageWithContent: CrosswordPageWithContent,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val participatingInTest = ActiveExperiments.isParticipating(DCRCrosswords)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (participatingInTest) RemoteRender
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
