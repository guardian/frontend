package services

import experiments.{ActiveExperiments, NGInteractiveDCR}
import play.api.mvc.{RequestHeader}

sealed trait RenderingTier
object Legacy extends RenderingTier
object Election2020Hack extends RenderingTier
object DotcomRendering extends RenderingTier

// Special2020Election is a temporary case introduced for the special handling of the work needed
// for the US election Nov 20202. It's essentially the hack version of DotcomRendering , which is
// not going to be ready on time.

object ApplicationsDotcomRenderingInterface {
  def getRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {
    val isSpecialElection =
      (path == "world/ng-interactive/2020/oct/20/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready")
    val isAmp = (request.host.contains("amp"))
    val isExperiment = ActiveExperiments.isParticipating(NGInteractiveDCR)
    (isSpecialElection && isAmp, isExperiment) match {
      case (true, _)  => Election2020Hack
      case (_, true)  => DotcomRendering
      case (_, false) => Legacy
    }
  }

  def getHtmlFromDCR(): String = {
    "Experiment: NGInteractiveDCR (2)"
  }
}

object ApplicationsSpecial2020Election {
  def atomIdToCapiPath(atomId: String): String = {
    // atomId = "interactives/2020/07/interactive-vaccine-tracker/default"
    "atom/interactive/interactives/2020/07/interactive-vaccine-tracker/amp-page"
  }

}
