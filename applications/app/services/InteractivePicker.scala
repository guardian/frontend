package services

import com.gu.contentapi.client.model.v1.{CapiDateTime, ItemResponse, Tag}
import conf.switches.Switches.InteractivePickerFeature
import play.api.mvc.RequestHeader
import implicits.Requests._
import org.joda.time.{DateTime, DateTimeZone, LocalDate}
import org.joda.time.format.DateTimeFormat

sealed trait RenderingTier
object DotcomRendering extends RenderingTier
object FrontendLegacy extends RenderingTier
object USElectionTracker2020AmpPage extends RenderingTier

object InteractivePicker {

  val migratedPaths = List(
    "/sport/ng-interactive/2018/dec/26/lebron-james-comments-nba-nfl-divide",
  )

  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }

  def dateIsPostTransition(date: String): Boolean = {
    // It's the responsibility of the caller of this function to ensure that the date
    // is given as string in format "YYYY-MM-DD", otherwise "results may vary".
    date >= "2021-06-23"
  }

  def isOptedOut(tags: List[Tag]): Boolean = {
    tags.exists(t => t.id == "tracking/platformfunctional/dcrblacklist")
  }

  def getRenderingTier(path: String, datetime: CapiDateTime, tags: List[Tag])(implicit
      request: RequestHeader,
  ): RenderingTier = {
    val isSpecialElection = USElection2020AmpPages.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    val forceDCR = request.forceDCR
    val isMigrated = migratedPaths.contains(if (path.startsWith("/")) path else "/" + path)
    val switchOn = InteractivePickerFeature.isSwitchedOn
    val publishedPostSwitch = dateIsPostTransition(datetime.iso8601.substring(0, 10))

    if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else if (forceDCR || isMigrated) DotcomRendering
    else if (switchOn && !isOptedOut(tags) && publishedPostSwitch) DotcomRendering
    else FrontendLegacy
  }
}
