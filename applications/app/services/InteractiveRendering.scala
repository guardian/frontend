package services

import play.api.mvc.RequestHeader
import implicits.Requests._
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.joda.time.format.DateTimeFormat

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

  def dateTransform(date: String): String = {
    val monthLookupMap = Map(
      "jan" -> "01",
      "feb" -> "02",
      "mar" -> "03",
      "apr" -> "04",
      "may" -> "05",
      "jun" -> "06",
      "jul" -> "07",
      "aug" -> "08",
      "sep" -> "09",
      "oct" -> "10",
      "nov" -> "11",
      "dec" -> "12",
    )
    // This function takes a date in the form "2021/mar/05" and transforms it to be "2021-03-05"
    // We first replace "/" by "-" and then we try and substitute the month by its corresponding number.
    monthLookupMap.keys.fold(date.replace("/", "-")) { (date, month) =>
      date.replace(month, monthLookupMap(month))
    }
  }

  def getPathDate(path: String): Option[String] = {
    /*
      This function takes a path like books/ng-interactive/2021/mar/05/this-months-best-paperbacks-michelle-obama-jan-morris-and-more
      and then
        1. First extract the date "2021/mar/05"
        2. Transform it in YYYY-MM-DD format to be "2021-03-05"
     */
    val regex = """\d\d\d\d\/\w+\/\d\d""".r
    val date = regex.findFirstMatchIn(path).map(_.toString()).map(dateTransform)
    println(date)
    date
  }

  def dateIsPostTransition(date: String): Boolean = {
    // It's the responsibility of the caller of this function to ensure that the date
    // is given as string in format "YYYY-MM-DD", otherwise "results may vary".
    date >= "2021-06-01"
  }

  def decideRenderingTier(path: String)(implicit request: RequestHeader): RenderingTier = {
    // This function decides which paths are sent to DCR for rendering
    // We first check whether or not the path has been allow listed and then check the date

    if (allowListedPaths.contains(ensureStartingForwardSlash(path))) DotcomRendering
    else {
      getPathDate(path) match {
        case Some(date) => if (dateIsPostTransition(date)) DotcomRendering else FrontendLegacy
        case None       => FrontendLegacy // [1]
      }
    }
    /*
      [1] We could as well decide to send those to DCR 🤔 , but right now I am assuming that if it happens
          it's because of old contents not following the expected path format.
     */
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
