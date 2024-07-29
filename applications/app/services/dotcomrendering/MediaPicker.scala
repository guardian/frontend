package services.dotcomrendering

import common.GuLogging
import model.Cors.RichRequestHeader
import model.{MediaPage, Video, Audio}
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger
import navigation.NavLinks.media
import experiments.ActiveExperiments
import conf.switches.Switches.DCRVideoPages

object MediaPicker extends GuLogging {

  /** Add to this function any logic for including/excluding an audio/video article from being rendered with DCR
    *
    * Currently defaulting to false until we implement in DCR
    */
  private def dcrCouldRender(mediaPage: MediaPage): Boolean = {
    mediaPage.media match {
      case Video(content, source, mediaAtom) => true
      case Audio(content)                    => false
      case _                                 => false
    }
  }

  private def dcrLogFlags(mediaPage: MediaPage): Map[String, String] = {
    Map(
      ("isVideo", mediaPage.media.isInstanceOf[Video].toString()),
      ("isAudio", mediaPage.media.isInstanceOf[Audio].toString()),
    )
  }

  def getTier(
      mediaPage: MediaPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val dcrCanRender = dcrCouldRender(mediaPage)
    val flags = dcrLogFlags(mediaPage)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && DCRVideoPages.isSwitchedOn) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(s"path executing in dotcomponents", flags, mediaPage.media)
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", flags, mediaPage.media)
    }

    tier
  }
}
