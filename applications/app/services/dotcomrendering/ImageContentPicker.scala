package services.dotcomrendering

import common.GuLogging
import experiments.{ActiveExperiments, DCRImageContent}
import model.Cors.RichRequestHeader
import model.ImageContentPage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object ImageContentPicker extends GuLogging {

  /**
    *
    * Add to this function any logic for including/excluding
    * an image article from being rendered with DCR
    *
    * Currently defaulting to false until we implement image articles in DCR
    *
    * */
  private def dcrCouldRender(imageContentPage: ImageContentPage): Boolean = {
    false
  }

  def getTier(
      imageContentPage: ImageContentPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val participatingInTest = ActiveExperiments.isParticipating(DCRImageContent)
    val dcrCanRender = dcrCouldRender(imageContentPage)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && participatingInTest) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(s"path executing in dotcomponents", Map.empty, imageContentPage.image)
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", Map.empty, imageContentPage.image)
    }

    tier
  }
}
