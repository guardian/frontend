package services.dotcomrendering

import common.GuLogging
import model.Cors.RichRequestHeader
import model.GalleryPage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger
import conf.switches.Switches.DCARGalleryPages

object GalleryPicker extends GuLogging {

  /** Add to this function any logic for including/excluding a gallery article from being rendered with DCR
    *
    * Currently defaulting to false until we implement image articles in DCR
    */
  private def dcrCouldRender(galleryPage: GalleryPage): Boolean = {
    false
  }

  def getTier(
      galleryPage: GalleryPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val dcrCanRender = dcrCouldRender(galleryPage)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR && DCARGalleryPages.isSwitchedOn()) RemoteRender
      else if (dcrCanRender && DCARGalleryPages.isSwitchedOn()) RemoteRender
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
