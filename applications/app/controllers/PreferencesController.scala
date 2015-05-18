package controllers

import model.{Cached, PreferencesMetaData}
import play.api.mvc.{Action, Controller}

object PreferencesController extends Controller with common.ExecutionContexts {

  def userPrefs() = Action { implicit request =>
    Cached(300) {
      Ok(views.html.preferencesPage(new PreferencesMetaData()))
    }
  }
}
