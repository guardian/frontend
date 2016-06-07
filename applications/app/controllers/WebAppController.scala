package controllers

import common.{JsonComponent, Edition, ExecutionContexts, Logging}
import conf.Static
import model.Cached.RevalidatableResult
import model._
import play.api.mvc.{Action, Controller, RequestHeader, Result}
import play.api.libs.json.{JsArray, JsString, JsObject}

import scala.concurrent.Future

object WebAppController extends Controller with ExecutionContexts with Logging {

  def serviceWorker() = Action { implicit request =>
    Cached(60) { RevalidatableResult.Ok(templates.js.serviceWorker()) }
  }

  def manifest() = Action { implicit request =>
    Cached(3600) { RevalidatableResult.Ok(templates.js.webAppManifest()) }
  }
}
