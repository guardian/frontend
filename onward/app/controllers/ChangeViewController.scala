package controllers

import play.api.mvc._

object ChangeViewController extends Controller with PreferenceController {

  def render(platform: String, redirectUrl: String) = Action { implicit request =>
    platform match {
      case "mobile" | "responsive" => switchTo("GU_VIEW" -> "responsive", redirectUrl)
      case "desktop" | "classic"   => switchTo("GU_VIEW" -> "classic", redirectUrl)
      case _ => NotFound("unknown platform")
    }
  }
}