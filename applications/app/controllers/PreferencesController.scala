package controllers

import common.{Logging, ExecutionContexts}
import model._
import play.api.mvc.{Action, Controller}

object PreferencesController extends Controller with ExecutionContexts with Logging {
  def userPrefs() = Action { implicit request =>
    Ok(views.html.preferencesPage(new PreferencesMetaData()))
  }
}
