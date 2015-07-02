package controllers

import common.ExecutionContexts
import model.Cached
import play.api.mvc.{Action, Controller}

object WebAppController extends Controller with ExecutionContexts {

  def serviceWorker() = Action { implicit request =>
    Cached(3600) {
      conf.Switches.NotificationsSwitch.isSwitchedOn match {
        case true => Ok(templates.js.serviceWorker())
        case false => NotFound
      }
    }
  }

  def manifest() = Action {
    Cached(3600) { Ok(templates.js.webAppManifest()) }
  }
}
