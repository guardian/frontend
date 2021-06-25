package services

import model.Tag
import conf.switches.Switches.InteractivePickerFeature
import implicits.{AmpFormat, RequestFormat}
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
    tags.exists(t => t.id == "tracking/platformfunctional/dcroptout")
  }

  def isAmpOptedIn(tags: List[Tag]): Boolean = {
    tags.exists(t => t.id == "tracking/platformfunctional/ampinteractive")
  }

  def getRenderingTier(requestFormat: RequestFormat, path: String, datetime: DateTime, tags: List[Tag])(implicit
      request: RequestHeader,
  ): RenderingTier = {
    val forceDCR = request.forceDCR
    val isMigrated = migratedPaths.contains(if (path.startsWith("/")) path else "/" + path)
    val switchOn = InteractivePickerFeature.isSwitchedOn
    val publishedPostSwitch = dateIsPostTransition(datetime)
    val isOptedInAmp = (requestFormat == AmpFormat) && isAmpOptedIn(tags)
    val isWebNotOptedOut = (requestFormat == AmpFormat) && !isOptedOut(tags)

    if (forceDCR || isMigrated || isOptedInAmp) DotcomRendering
    else if (switchOn && publishedPostSwitch && isWebNotOptedOut) DotcomRendering
    else FrontendLegacy
  }
}
