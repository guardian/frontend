package services

import play.api.mvc.RequestHeader
import play.twirl.api.Html

// ApplicationsSpecial2020Election is a temporary object introduced for the special handling
// of the US election Nov 2020 results election tracker, a ng-interactive page which we need an amp version of,
// something that DCR doesn't yet know how to do. It's essentially the hack version of
// ApplicationsDotcomRenderingInterface , which is not ready ; a (slower) work in progress.

object ApplicationsSpecial2020Election {
  val specialHandlingPaths = List(
    "/world/ng-interactive/2020/oct/20/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready", // test 1
    "/world/ng-interactive/2020/oct/29/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready", // test 2
    "/us-news/ng-interactive/2020/nov/03/us-election-2020-live-results-donald-trump-joe-biden-who-won-presidential-republican-democrat", // US election tracker
  )
  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }
  def pathIsSpecialHanding(path: String): Boolean = {
    /*
      We pass the path through `ensureStartingForwardSlash` because
      when called from `ApplicationsDotcomRenderingInterface.getRenderingTier` it comes without starting slash, but
      when called from `InteractiveHtmlPage.html` it comes with it.
     */
    specialHandlingPaths.contains(ensureStartingForwardSlash(path))
  }
  def atomIdToCapiPath(atomId: String): String = {
    /*
        This function transforms an atom id
          "interactives/2020/07/interactive-vaccine-tracker/default"
        into the corresponding amp capi query path
          "atom/interactive/interactives/2020/07/interactive-vaccine-tracker/amp-page"

        Election tracker:
          "interactives/2020/11/us-election/prod/default" (expected, to be confirmed)
          "atom/interactive/interactives/2020/11/us-election/prod/amp-page"
     */
    (Array("atom", "interactive") ++ atomId.split("/").dropRight(1) ++ Array("amp-page")).mkString("/")
  }

  def ampTagHtml(path: String)(implicit request: RequestHeader): Html = {
    if (ApplicationsSpecial2020Election.pathIsSpecialHanding(path)) {
      Html(
        s"""<link rel="amphtml" href="https://amp.theguardian.com${ensureStartingForwardSlash(path)}">""",
      )
    } else {
      Html("")
    }
  }
}
