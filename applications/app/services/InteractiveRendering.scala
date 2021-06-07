package services

import play.api.mvc.RequestHeader
import implicits.Requests._

sealed trait RenderingTier
object DotcomRendering extends RenderingTier
object FrontendLegacy extends RenderingTier

object USElectionTracker2020AmpPage extends RenderingTier

object InteractiveRendering {

  val migratedPaths = List(
    "/sport/ng-interactive/2018/dec/26/lebron-james-comments-nba-nfl-divide",
  )

  def getRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {
    val isSpecialElection = ApplicationsUSElection2020AmpPages.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    val forceDCR = request.forceDCR
    val isMigrated = migratedPaths.contains(if (path.startsWith("/")) path else "/" + path)

    if (forceDCR || isMigrated) DotcomRendering
    else if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else FrontendLegacy
  }
}
