package services

import com.gu.contentapi.client.utils.format.ImmersiveDisplay
import model.{ContentFormat, Interactive, Tag}
import conf.switches.Switches.InteractivePickerFeature
import implicits.{AmpFormat, HtmlFormat, RequestFormat}
import play.api.mvc.RequestHeader
import implicits.Requests._
import model.dotcomrendering.InteractiveSwitchOver
import org.joda.time.DateTime

sealed trait RenderingTier
object DotcomRendering extends RenderingTier
object FrontendLegacy extends RenderingTier
object USElectionTracker2020AmpPage extends RenderingTier

object InteractivePicker {

  // Interactives since the switchover are developed in DCR and so known to
  // work. (And are almost certainly broken in Frontend.)
  def dateIsPostTransition(date: DateTime): Boolean = {
    date.isAfter(InteractiveSwitchOver.date)
  }

  def isOptedOut(tags: List[Tag]): Boolean = {
    tags.exists(t => t.id == "tracking/platformfunctional/dcroptout")
  }

  def isAmpOptedIn(format: RequestFormat, tags: List[Tag]): Boolean = {
    format == AmpFormat && tags.exists(t => t.id == "tracking/platformfunctional/ampinteractive")
  }

  // A test article which we went live with early to gain confidence.
  def isAllowList(id: String): Boolean = {
    id == "sport/ng-interactive/2018/dec/26/lebron-james-comments-nba-nfl-divide"
  }

  // Cartoons represent almost 50% of published interactives and we know these
  // work now on DCR.
  def isCartoon(tags: List[Tag]): Boolean = {
    val cartoonTagIds = Set("tone/cartoons", "profile/david-squires")
    tags.exists(tag => cartoonTagIds.contains(tag.id))
  }

  // Immersives tend to work fairly well in DCR as they don't rely on modifying
  // existing page markup.
  def isImmersive(format: Option[ContentFormat]): Boolean = {
    format.exists(_.display == ImmersiveDisplay)
  }

  def getRenderingTier(interactive: Interactive, requestFormat: RequestFormat)(implicit
      request: RequestHeader,
  ): RenderingTier = {
    val tags = interactive.tags.tags
    val forceDCR = request.forceDCR
    val switchOn = InteractivePickerFeature.isSwitchedOn

    if (!switchOn) FrontendLegacy
    else if (forceDCR) DotcomRendering
    else if (
      !isOptedOut(tags) && (
        dateIsPostTransition(interactive.trail.webPublicationDate) ||
        isCartoon(tags) ||
        isImmersive(interactive.metadata.format) ||
        isAmpOptedIn(requestFormat, tags) ||
        isAllowList(interactive.metadata.id)
      )
    )
      DotcomRendering
    else FrontendLegacy
  }
}
