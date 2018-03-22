package commercial.controllers

import common.Logging
import model.TinyResponse
import play.api.libs.json.JsValue
import play.api.libs.json.Json.prettyPrint
import play.api.mvc._

class PrebidAnalyticsController(val controllerComponents: ControllerComponents) extends BaseController with Logging {

  def insert(): Action[JsValue] = Action(parse.json) { implicit request =>
    log.info(prettyPrint(request.body))
    TinyResponse.noContent()
  }

  def getOptions: Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("PUT, OPTIONS"))
  }
}
