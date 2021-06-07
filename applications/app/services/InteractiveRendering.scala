package services

import com.gu.contentapi.client.model.v1.{CapiDateTime, ItemResponse}
import play.api.mvc.RequestHeader
import implicits.Requests._
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.joda.time.format.DateTimeFormat

sealed trait RenderingTier
object DotcomRendering extends RenderingTier
object FrontendLegacy extends RenderingTier
object USElectionTracker2020AmpPage extends RenderingTier

object InteractiveRendering {

  val migratedPaths = List(
    "/sport/ng-interactive/2018/dec/26/lebron-james-comments-nba-nfl-divide",
  )
  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }

  def dateIsPostTransition(date: String): Boolean = {
    // It's the responsibility of the caller of this function to ensure that the date
    // is given as string in format "YYYY-MM-DD", otherwise "results may vary".
    date >= "2021-06-01"
  }

  def decideRenderingTier(path: String, date: CapiDateTime)(implicit request: RequestHeader): RenderingTier = {
    // This function decides which paths are sent to DCR for rendering
    // We first check whether or not the path has been allow listed and then check the date of the atom

    if (migratedPaths.contains(ensureStartingForwardSlash(path))) DotcomRendering
    else if (dateIsPostTransition(date.iso8601.substring(0, 10))) DotcomRendering
    else FrontendLegacy
  }

  def getRenderingTier(path: String, date: CapiDateTime)(implicit request: RequestHeader): RenderingTier = {
    val isSpecialElection = USElection2020AmpPages.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    val forceDCR = request.forceDCR
    val isMigrated = migratedPaths.contains(if (path.startsWith("/")) path else "/" + path)

    if (forceDCR || isMigrated) DotcomRendering
    else if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else decideRenderingTier(path, date)
  }
}
