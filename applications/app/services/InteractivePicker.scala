package services

import com.gu.contentapi.client.model.v1.Tag
import conf.switches.Switches.InteractivePickerFeature
import play.api.mvc.RequestHeader
import implicits.Requests._
import model.dotcomrendering.InteractiveSwitchOver
import org.joda.time.DateTime

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

  def dateIsPostTransition(date: DateTime): Boolean = {
    date.isAfter(InteractiveSwitchOver.date)
  }

  def isOptedOut(tags: List[Tag]): Boolean = {
    tags.exists(t => t.id == "tracking/platformfunctional/dcrblacklist")
  }

  def getRenderingTier(path: String, datetime: DateTime, tags: List[Tag])(implicit
      request: RequestHeader,
  ): RenderingTier = {
    val isSpecialElection = USElection2020AmpPages.pathIsSpecialHanding(path)
    val isAmp = request.host.contains("amp")
    val forceDCR = request.forceDCR
    val isMigrated = migratedPaths.contains(if (path.startsWith("/")) path else "/" + path)
    val switchOn = InteractivePickerFeature.isSwitchedOn
    val publishedPostSwitch = dateIsPostTransition(datetime)

    if (isSpecialElection && isAmp) USElectionTracker2020AmpPage
    else if (forceDCR || isMigrated) DotcomRendering
    else if (switchOn && !isOptedOut(tags) && publishedPostSwitch) DotcomRendering
    else FrontendLegacy
  }
}
