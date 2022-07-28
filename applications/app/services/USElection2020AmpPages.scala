package services

import play.api.mvc.RequestHeader
import play.twirl.api.Html
import scala.util.matching.Regex

/*
   This object was introduced for the special handling of the US election Nov 2020 results election tracker
   A ng-interactive page which we need an amp version of, something that DCR doesn't yet know how to do.

   This code will live as long as we want to the Election Tracker to have an AMP URL.
 */

object USElection2020AmpPages {

  val specialPathsToCapiIdsMap = Map(
    "/world/ng-interactive/2020/oct/20/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready" -> "atom/interactive/interactives/2020/07/interactive-vaccine-tracker/amp-page",
    "/world/ng-interactive/2020/oct/29/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready" -> "atom/interactive/interactives/2020/07/interactive-vaccine-tracker/amp-page",
    "/us-news/ng-interactive/2020/nov/03/us-election-2020-live-results-donald-trump-joe-biden-who-won-presidential-republican-democrat" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/03/us-election-2020-live-results-donald-trump-joe-biden-presidential-votes-arizona-nevada-pennsylvania-georgia" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/05/us-election-2020-live-results-donald-trump-joe-biden-presidential-votes-arizona-nevada-pennsylvania-georgia" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/07/us-election-2020-live-results-donald-trump-joe-biden-presidential-votes-pennsylvania-georgia-arizona-nevada" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/08/us-election-2020-live-results-donald-trump-joe-biden-presidential-votes-pennsylvania-georgia-arizona-nevada" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/12/us-election-results-2020-joe-biden-donald-trump-presidential-electoral-college-votes" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/13/us-election-results-2020-joe-biden-donald-trump-presidential-electoral-college-votes" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/14/us-election-results-2020-joe-biden-donald-trump-presidential-electoral-college-votes" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/15/us-election-results-2020-joe-biden-donald-trump-presidential-electoral-college-votes" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/16/us-election-results-2020-joe-biden-donald-trump-presidential-electoral-college-votes" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    "/us-news/ng-interactive/2020/nov/17/us-election-results-2020-joe-biden-won-donald-trump-presidential-electoral-college-votes" -> "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
  )
  val specialPaths = specialPathsToCapiIdsMap.keys.toList

  val electionTrackerPathsRegexes: Array[Regex] = Array(
    """^/us-news/ng-interactive/2020/nov/\d\d/us-election-results-2020-""".r,
    """^/us-news/ng-interactive/2020/dec/\d\d/us-election-results-2020-""".r,
  )

  def pathIsElectionTracker(path: String): Boolean = {
    // This function was introduced to avoid having to update `specialPathsToCapiIdsMap` every day with new path

    // We now assume that anything of the form
    // /us-news/ng-interactive/2020/nov/??/us-election-results-2020-* , or
    // /us-news/ng-interactive/2020/dev/??/us-election-results-2020-*
    // is a request for the Election Tracker.

    electionTrackerPathsRegexes.exists(_.findFirstIn(path).isDefined)
  }

  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }

  def pathIsSpecialHanding(path: String): Boolean = {
    val path1 = ensureStartingForwardSlash(path)
    specialPaths.contains(path1) || pathIsElectionTracker(path1)
  }

  def pathToAmpAtomId(path: String): String = {
    /*
        This version is a more limited, but much more robust version, of `defaultAtomIdToAmpAtomId`
        In particular, it doesn't rely on a particular format for the atom ids, and instead
        maps paths directly to capi query ids, which is fine since we essentially only want to support few urls.
     */
    specialPathsToCapiIdsMap.getOrElse(
      ensureStartingForwardSlash(path),
      "atom/interactive/interactives/2020/11/us-election/prod/amp-page",
    )
  }

  def ampTagHtml(path: String)(implicit request: RequestHeader): Html = {
    if (USElection2020AmpPages.pathIsSpecialHanding(path)) {
      Html(
        s"""<link rel="amphtml" href="https://amp.theguardian.com${ensureStartingForwardSlash(path)}">""",
      )
    } else {
      Html("")
    }
  }
}
