package services

import model.Tag
import conf.switches.Switches.InteractivePickerFeature
import implicits.{AmpFormat, HtmlFormat, RequestFormat}
import play.api.mvc.RequestHeader
import implicits.Requests._
import java.time.LocalDateTime
import services.dotcomrendering.PressedInteractives

sealed trait RenderingTier
object DotcomRendering extends RenderingTier
object FrontendLegacy extends RenderingTier
object USElectionTracker2020AmpPage extends RenderingTier
object PressedInteractive extends RenderingTier

object InteractivePicker {

  def ensureStartingForwardSlash(str: String): String = {
    if (!str.startsWith("/")) ("/" + str) else str
  }

  def getRenderingTier(
      path: String,
      isPressed: (String => Boolean) = PressedInteractives.isPressed,
  )(implicit
      request: RequestHeader,
  ): RenderingTier = {
    val forceDCROff = request.forceDCROff
    val fullPath = ensureStartingForwardSlash(path)

    // Allow us to quickly revert to rendering via frontend, if necessary
    val switchOn = InteractivePickerFeature.isSwitchedOn

    if (isPressed(fullPath) && switchOn) PressedInteractive
    else if (forceDCROff) FrontendLegacy
    else DotcomRendering
  }
}
