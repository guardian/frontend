package controllers

import common.{ExecutionContexts, Logging}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, Controller}

class WebAppController extends Controller with ExecutionContexts with Logging {

  def serviceWorker() = Action { implicit request =>
    Cached(60) { RevalidatableResult.Ok(templates.js.serviceWorker()) }
  }

  def manifest() = Action { implicit request =>
    Cached(3600) { RevalidatableResult.Ok(templates.js.webAppManifest()) }
  }
}

object WebAppController extends WebAppController
