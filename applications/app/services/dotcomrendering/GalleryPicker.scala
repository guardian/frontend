package services.dotcomrendering

import common.GuLogging
import conf.switches.Switches.DCARGalleyPages
import model.Cors.RichRequestHeader
import model.GalleryPage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object GalleryPicker extends GuLogging {
  def getTier(
      galleryPage: GalleryPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (DCARGalleyPages.isSwitchedOn) RemoteRender
      else LocalRender
    }

    if (tier == RemoteRender) {
      DotcomponentsLogger.logger.logRequest(s"path executing in dotcomponents", Map.empty, galleryPage.gallery)
    } else {
      DotcomponentsLogger.logger.logRequest(s"path executing in web", Map.empty, galleryPage.gallery)
    }

    tier
  }
}
