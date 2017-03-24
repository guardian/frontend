package controllers

import common.{ExecutionContexts, Logging}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, Controller}

class WebAppController(implicit context: ApplicationContext) extends Controller with ExecutionContexts with Logging {

  def serviceWorker() = Action { implicit request =>
    Cached(CacheTime.ServiceWorker) { RevalidatableResult.Ok(templates.js.serviceWorker()) }
  }

  def manifest() = Action { implicit request =>
    Cached(CacheTime.WebAppManifest) { RevalidatableResult.Ok(templates.js.webAppManifest()) }
  }
}
