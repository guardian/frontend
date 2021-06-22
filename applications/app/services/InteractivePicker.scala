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

case class InteractivePickerInputData(datetime: CapiDateTime, tags: List[Tag])

object InteractivePicker {

  val migratedPaths = List(
    "/sport/ng-interactive/2018/dec/26/lebron-james-comments-nba-nfl-divide",
  )

  val tagsBlockList: Set[String] = Set(
    "tracking/platformfunctional/dcrblacklist",
  )

  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }

  def dateIsPostTransition(date: String): Boolean = {
    // It's the responsibility of the caller of this function to ensure that the date
    // is given as string in format "YYYY-MM-DD", otherwise "results may vary".
    date >= "2021-06-23"
  }

  def isInTagBlockList(tags: List[Tag]): Boolean = {
    tags.exists(t => tagsBlockList(t.id))
  }

  def getRenderingTier(path: String, data: InteractivePickerInputData)(implicit
      request: RequestHeader,
  ): RenderingTier = {
    val isSpecialElection = USElection2020AmpPages.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    val forceDCR = request.forceDCR
    val isMigrated = migratedPaths.contains(if (path.startsWith("/")) path else "/" + path)
    val switchOn = InteractivePickerFeature.isSwitchedOn
    val publishedPostSwitch = dateIsPostTransition(data.datetime.iso8601.substring(0, 10))

    if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else if (forceDCR || isMigrated) DotcomRendering
    else if (!switchOn || isInTagBlockList(data.tags)) FrontendLegacy
    else if (publishedPostSwitch) DotcomRendering
    else FrontendLegacy
  }
}
