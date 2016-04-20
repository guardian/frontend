package controllers

import model.{PreferencesMetaData, Cached}
import play.api.mvc.{Action, Controller}

object PreferencesController extends Controller with common.ExecutionContexts {

  def indexPrefs() = Action { implicit request =>
    Cached(300) {
      Ok(views.html.preferences.index(new PreferencesMetaData()))
    }
  }
}
