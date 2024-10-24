package services.dotcomrendering

import common.GuLogging
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
    DotcomponentsLogger.logger.logRequest(s"path executing in web", Map.empty, galleryPage.gallery)

    LocalRender
  }
}
