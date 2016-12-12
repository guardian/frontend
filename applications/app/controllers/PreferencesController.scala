package controllers

import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, PreferencesMetaData}
import play.api.mvc.{Action, Controller}

class PreferencesController (implicit context: ApplicationContext) extends Controller with common.ExecutionContexts {
  import context._

  def indexPrefs() = Action { implicit request =>
    Cached(300) {
      RevalidatableResult.Ok(views.html.preferences.index(new PreferencesMetaData()))
    }
  }
}

