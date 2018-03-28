package commercial.controllers

import common.Logging
import conf.switches.Switches.prebidAnalytics
import model.Cached.WithoutRevalidationResult
import model.{CacheTime, Cached, TinyResponse}
import play.api.libs.json.JsValue
import play.api.libs.json.Json.prettyPrint
import play.api.mvc._

class PrebidAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  private def serve404[A](implicit request: Request[A]) =
    Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))

  def insert(): Action[JsValue] = Action(parse.json) { implicit request =>
    if (prebidAnalytics.isSwitchedOn) {
      log.info(prettyPrint(request.body))
      TinyResponse.noContent()
    } else
      serve404
  }

  def getOptions: Action[AnyContent] = Action { implicit request =>
    if (prebidAnalytics.isSwitchedOn)
      TinyResponse.noContent(Some("OPTIONS, PUT"))
    else
      serve404
  }
}
