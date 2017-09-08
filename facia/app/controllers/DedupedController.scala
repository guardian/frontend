package controllers

import common.{Edition, ImplicitControllerExecutionContext, Logging}
import controllers.front.FrontJsonFapiLive
import layout.Front
import play.api.libs.json.Json
import play.api.mvc.{BaseController, ControllerComponents}
import implicits.Requests._

class DedupedController(frontJsonFapi: FrontJsonFapiLive, val controllerComponents: ControllerComponents) extends BaseController with Logging with ImplicitControllerExecutionContext {

  def getDedupedForPath(path: String) = Action.async { request =>
    frontJsonFapi.get(path).map {
      case Some(pressedFront) =>
        val dedupedFrontResult = Front.fromPressedPageWithDeduped(pressedFront, Edition(request), adFree = request.isAdFree).deduped
        Ok(Json.toJson(dedupedFrontResult))
      case None => NotFound
    }
  }
}
