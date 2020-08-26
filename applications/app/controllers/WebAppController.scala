package controllers

import common.{ImplicitControllerExecutionContext, Logging}
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

class WebAppController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with Logging {

  def serviceWorker(): Action[AnyContent] =
    Action { implicit request =>
      Cached(CacheTime.ServiceWorker) { RevalidatableResult.Ok(templates.js.serviceWorker()) }
    }

  def manifest(): Action[AnyContent] =
    Action { implicit request =>
      Cached(CacheTime.WebAppManifest) { RevalidatableResult.Ok(templates.js.webAppManifest()) }
    }
}
