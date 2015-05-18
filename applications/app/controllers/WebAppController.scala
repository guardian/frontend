package controllers

import common.ExecutionContexts
import model.Cached
import play.api.mvc.{Action, Controller}

object WebAppController extends Controller with ExecutionContexts {

  def serviceWorker() = Action { implicit request =>
    Cached(3600) {
      Ok(templates.js.serviceWorker())
    }
  }

  def manifest() = Action {
    Cached(3600) {
      Ok(templates.js.webAppManifest())
    }
  }
}
