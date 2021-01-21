package services

import play.api.mvc.RequestHeader

sealed trait RenderingTier
object Legacy extends RenderingTier
object USElection2020AmpPage extends RenderingTier

object ApplicationsInteractiveRendering {
  def getRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {
    val isSpecialElection = ApplicationsSpecial2020Election.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    if (isSpecialElection && isAmp) USElection2020AmpPage else Legacy
  }
}
