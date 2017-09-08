package controllers

import play.api.mvc._

class ChangeAlphaController extends Controller with PreferenceController {

  def render(optAction: String, redirectUrl: String) = Action { implicit request =>
    val abCookieName: String = "GU_FRONT_ALPHAS"
    optAction match {
      case "opt-in"  => switchTo(Seq(abCookieName -> "true", "GU_VIEW" -> ""), redirectUrl)
      case "opt-out" => switchTo(Seq(abCookieName -> "false", "GU_VIEW" -> ""), redirectUrl)
      case _ => NotFound("unknown action")
    }
  }

}

object ChangeAlphaController extends ChangeAlphaController
