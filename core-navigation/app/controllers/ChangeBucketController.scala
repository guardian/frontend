package controllers

import play.api.mvc._

object ChangeBucketController extends Controller with PreferenceController {

  val abCookieName: String = "GU_ALPHA"

  def render(optaction: String, redirectUrl: String) = Action { implicit request =>
    optaction match {
      case "optin"  => switchTo(abCookieName -> "True", redirectUrl)
      case "optout" => switchTo(abCookieName -> "False", redirectUrl)
      case _ => NotFound("unknown action")
    }
  }
}
