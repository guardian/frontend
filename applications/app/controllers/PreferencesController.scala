package controllers

import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, PreferencesMetaData}
import play.api.mvc.{BaseController, ControllerComponents}

class PreferencesController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController with common.ImplicitControllerExecutionContext {

  def indexPrefs() = Action { implicit request =>
    Cached(300) {
      RevalidatableResult.Ok(views.html.preferences.index(new PreferencesMetaData()))
    }
  }
}

