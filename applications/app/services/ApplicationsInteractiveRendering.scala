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

object ApplicationsInteractiveRendering {

  // allowListedPaths is use to jumpstart the router (which decides which between frontend and DRC does the rendering)
  val allowListedPaths = List(
    "environment/ng-interactive/2021/feb/23/beneath-the-blue-dive-into-a-dazzling-ocean-under-threat-interactive",
  )

  def router(path: String)(implicit request: RequestHeader): RenderingTier = {
    // This function decides which paths are sent to DCR for rendering
    // At first we use allowListedPaths
    if (allowListedPaths.contains(path)) DotcomRendering else FrontendLegacy
  }

  def getRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {

    val isSpecialElection = ApplicationsUSElection2020AmpPages.pathIsSpecialHanding(path)

    // Date   : 01st June 2021
    // Author : Pascal
    // Note   : We define isWeb as the opposite of isAmp because I think it leads to easier to understand code
    //          If it turns out that somebody disagrees, let me know.
    val isWeb = !request.host.contains("amp")

    val forceDCR = request.forceDCR

    (isSpecialElection, isWeb, forceDCR) match {
      case (true, false, _) => USElectionTracker2020AmpPage // Election tracker on AMP
      case (true, true, _)  => FrontendLegacy // Election tracker on web [1]
      case (_, false, _)    => FrontendLegacy // Regular AMP [2]
      case (_, true, true)  => DotcomRendering // WEB with forceDCR
      case _                => router(path) // [3] Web with no forceDCR flag
    }

    // [1] We will change that in the future, but for the moment we legacy render the election tracker.
    // [2] We will change that in the future, but for the moment we legacy render all amp pages.
    // [3] This is were the regular routing is performed, same job as the Article Picker.
  }
}
