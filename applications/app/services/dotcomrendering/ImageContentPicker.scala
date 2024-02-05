package services.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block, ElementType}
import common.GuLogging
import implicits.AppsFormat
import model.Cors.RichRequestHeader
import model.ImageContentPage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object ImageContentPicker extends GuLogging {

  def getTier(
      imageContentPage: ImageContentPage,
  )(implicit
      request: RequestHeader,
  ): RenderType = {

    val tier = {
      if (request.forceDCROff) LocalRender
      else RemoteRender
    }

    if (tier == RemoteRender) {
      if (request.getRequestFormat == AppsFormat)
        DotcomponentsLogger.logger.logRequest(
          s"[ArticleRendering] path executing in dotcom rendering for apps (DCAR)",
          Map.empty,
          imageContentPage.image,
        )
      else
        DotcomponentsLogger.logger.logRequest(
          s"[ArticleRendering] path executing in dotcomponents",
          Map.empty,
          imageContentPage.image,
        )
    } else {
      DotcomponentsLogger.logger.logRequest(
        s"[ArticleRendering] path executing in web (frontend)",
        Map.empty,
        imageContentPage.image,
      )
    }

    tier
  }
}
