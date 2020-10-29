package services

import play.api.mvc.RequestHeader
import play.twirl.api.Html

object ApplicationsSpecial2020Election {
  val specialHandlingPaths = List(
    "/world/ng-interactive/2020/oct/20/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready",
    "/world/ng-interactive/2020/oct/29/covid-vaccine-tracker-when-will-a-coronavirus-vaccine-be-ready",
  )
  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }
  def pathIsSpecialHanding(path: String): Boolean = {
    /*
      We pass the path through `ensureStartingForwardSlash` because
      when called from `ApplicationsDotcomRenderingInterface.getRenderingTier` it comes without starting slash, but
      when called from `ApplicationsSpecial2020Election.ampTagHtml` it comes with it.
     */
    specialHandlingPaths.contains(ensureStartingForwardSlash(path))
  }
  def atomIdToCapiPath(atomId: String): String = {
    /*
        This function transforms and atom id
          "interactives/2020/07/interactive-vaccine-tracker/default"
        into the corresponding amp capi query path
          "atom/interactive/interactives/2020/07/interactive-vaccine-tracker/amp-page"

        I realise that this code is a little bit fragile, hopefully we will double check beforehand
        that the logic still applies for the election result tracker.
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
