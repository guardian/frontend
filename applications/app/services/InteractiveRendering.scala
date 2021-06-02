package services

import play.api.mvc.RequestHeader
import implicits.Requests._

sealed trait RenderingTier
object FrontendLegacy extends RenderingTier
object USElectionTracker2020AmpPage extends RenderingTier
object DotcomRendering extends RenderingTier

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

object InteractiveRendering {

  // allowListedPaths is use to jumpstart the router (which decides which between frontend and DRC does the rendering)
  val allowListedPaths = List(
    "/sport/ng-interactive/2018/dec/26/lebron-james-comments-nba-nfl-divide",
  )
  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }

  def decideRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {
    // This function decides which paths are sent to DCR for rendering
    // At first we use allowListedPaths
    if (allowListedPaths.contains(ensureStartingForwardSlash(path))) DotcomRendering else FrontendLegacy
  }

  def getRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {

    val isSpecialElection = ApplicationsUSElection2020AmpPages.pathIsSpecialHanding(path)

    val isAmp = request.host.contains("amp")
    val isWeb = !isAmp

    val forceDCR = request.forceDCR

    if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else if (isSpecialElection && isWeb) FrontendLegacy // [1]
    else if (isAmp) FrontendLegacy // [2]
    else if (forceDCR) DotcomRendering
    else decideRenderingTier(path)

    // [1] We will change that in the future, but for the moment we legacy render the election tracker.
    // [2] We will change that in the future, but for the moment we legacy render all amp pages.
  }
}
