package controllers

import model.Cached.RevalidatableResult
import model.{Cached, PreferencesMetaData}
import play.api.Environment
import play.api.mvc.{Action, Controller}

class PreferencesController (implicit env: Environment) extends Controller with common.ExecutionContexts {

  def indexPrefs() = Action { implicit request =>
    Cached(300) {
      RevalidatableResult.Ok(views.html.preferences.index(new PreferencesMetaData()))
    }
  }
}

