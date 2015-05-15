package controllers

import common.{Logging, ExecutionContexts}
import conf.Static
import model._
import play.api.mvc.{Action, Controller}
import play.api.libs.json.Json

object PreferencesController extends Controller with ExecutionContexts with Logging {
  def userPrefs() = Action { implicit request =>
    Ok(views.html.preferencesPage(new PreferencesMetaData()))
  }

  case class Manifest(name: String,
                      icons: List[Icon],
                      display: String,
                      gcm_sender_id: String,
                      gcm_user_visible_only: Boolean)

  case class Icon(`type`: String, sizes: String, src: String)

  implicit val iconWrites = Json.writes[Icon]

  val manifestWrites = Json.writes[Manifest]

  def manifest() = Action { Cached(3600) {
    val icon = Icon(`type`="image/png", sizes="152x152", src=Static("images/favicons/152x152.png").toString)

    Ok(manifestWrites.writes(Manifest(
      name="The Guardian",
      icons=List(icon),
      display="browser",
      gcm_sender_id="162380663509",
      gcm_user_visible_only=true)).toString())
  } }
}
