package services.dotcomrendering

import common.GuLogging
import model.Cors.RichRequestHeader
import model.GalleryPage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object GalleryPicker extends GuLogging {

  /**
    *
    * Add to this function any logic for including/excluding
    * a gallery article from being rendered with DCR
    *
    * Currently defaulting to false until we implement image articles in DCR
    *
    * */
  private def dcrCouldRender(galleryPage: GalleryPage): Boolean = {
    false
  }

  def getTier(
      galleryPage: GalleryPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val participatingInTest = false // until we create a test for this content type
    val dcrCanRender = dcrCouldRender(galleryPage)

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && participatingInTest) RemoteRender
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
