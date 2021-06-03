package services

import play.api.mvc.RequestHeader
import implicits.Requests._

sealed trait RenderingTier
object DotcomRendering extends RenderingTier
object FrontendLegacy extends RenderingTier

/*
  Date: 21st Jan 2020
  Author: Pascal

  This object was introduced in late 2020, to handle the routing between regular rendering of interactives
  versus the code that had been written to handle the US Presidential Election Tracker amp page.

  The tracker (an ng-interactive) didn't have a AMP page and there were two ways to provide one to it.
  1. Implement the support for it in DCR, or
  2. Implement support for it directly in the [applications] app, using the AMP page already present in CAPI.

  The former would have taken too long so we went for the latter.

  ----------------
  Author: Pascal
  Date: 21st April 2021

  We are now moving towards supporting interactives in DCR 🙂
 */
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
