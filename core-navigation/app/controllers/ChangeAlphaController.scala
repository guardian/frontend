package controllers

import play.api.mvc._

object ChangeAlphaController extends Controller with PreferenceController {

  def render(networkFront: String, optaction: String, redirectUrl: String) = Action { implicit request =>
    val abCookieName: String = s"GU_${networkFront.toUpperCase()}_ALPHA"
    optaction match {
      case "optin"  => switchTo303(abCookieName -> "true", redirectUrl)
      case "optout" => switchTo303(abCookieName -> "false", redirectUrl)
      case _ => NotFound("unknown action")
    }
  }

}
