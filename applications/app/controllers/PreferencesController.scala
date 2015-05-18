package controllers

import common.ExecutionContexts
import conf.Static
import model.{Cached, PreferencesMetaData}
import play.api.mvc.{Action, Controller}
import play.api.libs.json.Json

object PreferencesController extends Controller with ExecutionContexts {

  case class Icon(`type`: String, sizes: String, src: String)
  case class Manifest(name: String,
                      icons: List[Icon],
                      display: String,
                      gcm_sender_id: String,
                      gcm_user_visible_only: Boolean)

  private implicit val iconWrites = Json.writes[Icon]
  private implicit val manifestWrites = Json.writes[Manifest]

  private val icon = List(Icon(`type`="image/png", sizes="152x152", src=Static("images/favicons/152x152.png").toString))
  private val manifestData = Json.toJson(Manifest(
      name="The Guardian",
      icons=icon,
      display="browser",
      gcm_sender_id="162380663509",
      gcm_user_visible_only=true))

  def userPrefs() = Action { implicit request =>
    Cached(300) {
      Ok(views.html.preferencesPage(new PreferencesMetaData()))
    }
  }

  def manifest() = Action {
    Cached(3600) {
      Ok(manifestData)
    }
  }
}
