package controllers

import play.api.mvc._
import conf.Switches.GuShiftCookieSwitch

object ChangeViewController extends Controller with PreferenceController {

  def render(platform: String, redirectUrl: String) = Action { implicit request =>

    def shiftCookie(optChoice: String) = if (GuShiftCookieSwitch.isSwitchedOn) {
      request.cookies.get("GU_SHIFT")
        .map(cookie => s"${cookie.value}|$optChoice")
        .map(value => "GU_SHIFT" -> value) :: Nil
    } else {
      Nil
    }

    platform match {
      case "mobile" | "responsive" =>
        val cookies = (Some("GU_VIEW" -> "responsive") :: shiftCookie("opted-in")).flatten
        switchTo(cookies, redirectUrl)

      case "desktop" | "classic"   =>
        val cookies = (Some("GU_VIEW" -> "classic") :: shiftCookie("opted-out")).flatten
        switchTo(cookies, redirectUrl)

      case _ => NotFound("unknown platform")
    }
  }
}