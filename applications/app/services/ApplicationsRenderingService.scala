package services

import experiments.{ActiveExperiments, NGInteractiveDCR}
import play.api.mvc.RequestHeader

sealed trait RenderingTier
object Legacy extends RenderingTier
object DotcomRendering extends RenderingTier

object ApplicationsRenderingService {
  def getRenderingTier(implicit request: RequestHeader): RenderingTier = {
    if (ActiveExperiments.isParticipating(NGInteractiveDCR)) {
      DotcomRendering
    } else {
      Legacy
    }
  }
}
