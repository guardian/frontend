package services.dotcomrendering

import common.GuLogging
import model.Cors.RichRequestHeader
import model.{MediaPage, Video, Audio}
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger
import conf.switches.Switches.{DCRAudioPages, DCRVideoPages}

object MediaPicker extends GuLogging {

  /** Add to this function any logic for including/excluding an audio/video article from being rendered with DCR
    */
  private def dcrShouldRender(mediaPage: MediaPage): Boolean = {
    mediaPage.media match {
      case Audio(content)                    => DCRAudioPages.isSwitchedOn
      case Video(content, source, mediaAtom) => DCRVideoPages.isSwitchedOn
      case _                                 => false
    }
  }

  private def dcrLogFlags(mediaPage: MediaPage): Map[String, String] = {
    Map(
      ("isAudio", mediaPage.media.isInstanceOf[Audio].toString()),
      ("isVideo", mediaPage.media.isInstanceOf[Video].toString()),
    )
  }

  def getTier(
      mediaPage: MediaPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {
    val flags = dcrLogFlags(mediaPage)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrShouldRender(mediaPage)) RemoteRender
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
