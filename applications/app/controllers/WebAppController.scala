package controllers

import common.{ExecutionContexts, Logging}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, Controller}

class WebAppController(implicit context: ApplicationContext) extends Controller with ExecutionContexts with Logging {
  import context._

  def serviceWorker() = Action { implicit request =>
    Cached(60) { RevalidatableResult.Ok(templates.js.serviceWorker()) }
  }

  def manifest() = Action { implicit request =>
    Cached(3600) { RevalidatableResult.Ok(templates.js.webAppManifest()) }
  }
}
