package controllers

import play.api.mvc._

object ChangeAlphaController extends Controller with PreferenceController {

  val abCookieName: String = "GU_UK_ALPHA"

  def render(optaction: String, redirectUrl: String) = Action { implicit request =>
    optaction match {
      case "optin"  => switchTo(abCookieName -> "true", redirectUrl)
      case "optout" => switchTo(abCookieName -> "false", redirectUrl)
      case _ => NotFound("unknown action")
    }
  }
}
