package services

import com.gu.contentapi.client.model.v1.ItemResponse
import play.api.mvc.RequestHeader
import implicits.Requests._
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.joda.time.format.DateTimeFormat

sealed trait RenderingTier
object FrontendLegacy extends RenderingTier
object USElectionTracker2020AmpPage extends RenderingTier
object DotcomRendering extends RenderingTier

import com.gu.contentapi.client.model.v1.Content

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

  def dateIsPostTransition(date: String): Boolean = {
    // It's the responsibility of the caller of this function to ensure that the date
    // is given as string in format "YYYY-MM-DD", otherwise "results may vary".
    println(date)
    date >= "2021-06-01"
  }

  def decideRenderingTier(path: String, content: Content)(implicit request: RequestHeader): RenderingTier = {
    // This function decides which paths are sent to DCR for rendering
    // We first check whether or not the path has been allow listed and then check the date of the atom

    if (allowListedPaths.contains(ensureStartingForwardSlash(path))) DotcomRendering
    else {
      content.webPublicationDate match {
        case Some(date) => if (dateIsPostTransition(date.iso8601.substring(0, 10))) DotcomRendering else FrontendLegacy
        case None       => FrontendLegacy // [1]
      }
    }
    /*
      [1] We could as well decide to send those to DCR 🤔 , but right now I am assuming that if it happens
          it's because of old contents not following the expected path format.
     */
  }

  def getRenderingTier(path: String, content: Content)(implicit request: RequestHeader): RenderingTier = {

    val isSpecialElection = ApplicationsUSElection2020AmpPages.pathIsSpecialHanding(path)

    val isAmp = request.host.contains("amp")
    val isWeb = !isAmp

    val forceDCR = request.forceDCR

    if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else if (isSpecialElection && isWeb) FrontendLegacy // [1]
    else if (isAmp) FrontendLegacy // [2]
    else if (forceDCR) DotcomRendering
    else decideRenderingTier(path, content)

    // [1] We will change that in the future, but for the moment we legacy render the election tracker.
    // [2] We will change that in the future, but for the moment we legacy render all amp pages.
  }
}
