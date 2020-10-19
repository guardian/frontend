package services

import experiments.{ActiveExperiments, NGInteractiveDCR}
import play.api.mvc.RequestHeader

sealed trait RenderingTier
object Legacy extends RenderingTier
object DotcomRendering extends RenderingTier

object ApplicationsDotcomRenderingInterface {
  def getRenderingTier(implicit request: RequestHeader): RenderingTier = {
    if (ActiveExperiments.isParticipating(NGInteractiveDCR)) {
      DotcomRendering
    } else {
      Legacy
    }
  }

  def getHtmlFromDCR(): String = {
    "Experiment: NGInteractiveDCR (2)"
  }
}
