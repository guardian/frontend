package services

import conf.switches.Switches.InteractivePickerFeature
import play.api.mvc.RequestHeader
import implicits.Requests._
import services.dotcomrendering.PressedContent

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
      isPressed: (String => Boolean) = PressedContent.isPressed,
  )(implicit
      request: RequestHeader,
  ): RenderingTier = {
    // Allows us to press via InterativeLibrarian and also debug interactives rendering via dcr
    val fullPath = ensureStartingForwardSlash(path)

    // Allow us to quickly revert to rendering content (instead of serving pressed content)
    val switchOn = InteractivePickerFeature.isSwitchedOn

    if (request.forceDCROff) FrontendLegacy
    else if (request.forceDCR) DotcomRendering
    else if (isPressed(fullPath) && switchOn) PressedInteractive
    else DotcomRendering
  }
}
