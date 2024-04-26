package services.dotcomrendering

import common.GuLogging
import model.Cors.RichRequestHeader
import model.{MediaPage, Video, Audio}
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger
import experiments.DCRVideoPages
import navigation.NavLinks.media
import experiments.ActiveExperiments

object MediaPicker extends GuLogging {

  /**
    *
    * Add to this function any logic for including/excluding
    * an audio/video article from being rendered with DCR
    *
    * Currently defaulting to false until we implement in DCR
    *
    * */
  private def dcrCouldRender(mediaPage: MediaPage): Boolean = {
    mediaPage.media match {
      case Video(content, source, mediaAtom) => true
      case Audio(content)                    => false
      case _                                 => false
    }
  }

  def getTier(
      mediaPage: MediaPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    // defaulting to false until we are ready to release and create a 0% test
    val participatingInTest = ActiveExperiments.isParticipating(DCRVideoPages)
    val dcrCanRender = dcrCouldRender(mediaPage)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && participatingInTest) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(s"path executing in dotcomponents", Map.empty, mediaPage.media)
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", Map.empty, mediaPage.media)
    }

    tier
  }
}
