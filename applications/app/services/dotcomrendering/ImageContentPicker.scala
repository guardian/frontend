package services.dotcomrendering

import com.gu.contentapi.client.model.v1.{Block, ElementType}
import common.GuLogging
import model.Cors.RichRequestHeader
import model.ImageContentPage
import play.api.mvc.RequestHeader
import utils.DotcomponentsLogger

object ImageContentPicker extends GuLogging {

  def getTier(
      imageContentPage: ImageContentPage,
      mainBlock: Option[Block],
  )(implicit
      request: RequestHeader,
  ): RenderType = {
    val dcrCanRender =
      mainBlock.exists(block => block.elements.forall(element => element.`type` == ElementType.Cartoon))
    // Currently defaulting to false until we implement image articles in DCR
    val dcrShouldRender = false

    val tier = {
      if (request.forceDCROff) LocalRender
      else if (request.forceDCR) RemoteRender
      else if (dcrCanRender && dcrShouldRender) RemoteRender
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
