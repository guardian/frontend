package controllers

import model.{NotificationPreferencesMetaData, PreferencesMetaData, Cached}
import play.api.mvc.{Action, Controller}

object PreferencesController extends Controller with common.ExecutionContexts {

  def indexPrefs() = Action { implicit request =>
    Cached(300) {
      Ok(views.html.preferences.index(new PreferencesMetaData()))
    }
  }

  def notificationPrefs() = Action { implicit request =>
    Cached(300) {
      conf.switches.Switches.NotificationsSwitch.isSwitchedOn match {
        case true => Ok(views.html.preferences.notifications(new NotificationPreferencesMetaData()))
        case false => NotFound
      }
    }
  }
}
