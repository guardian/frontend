package controllers


import play.api.mvc._

object ChangeViewController extends Controller with PreferenceController {

  def render(platform: String, redirectUrl: String) = Action { implicit request =>
    platform match {
      case "mobile" | "desktop" => switchTo("GU_VIEW" -> platform, redirectUrl)
      case _ => NotFound("unknown platform")
    }
  }
}