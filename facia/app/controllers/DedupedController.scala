package controllers

import common.{Edition, ExecutionContexts, Logging}
import controllers.front.FrontJsonFapiLive
import layout.Front
import play.api.libs.json.Json
import play.api.mvc.{Action, AnyContent, Controller}

class DedupedController(frontJsonFapi: FrontJsonFapiLive) extends Controller with Logging with ExecutionContexts {

  def getDedupedForPath(path: String): Action[AnyContent] = Action.async { request =>
    frontJsonFapi.get(path).map {
      case Some(pressedFront) =>
        val dedupedFrontResult = Front.fromPressedPageWithDeduped(pressedFront, Edition(request)).deduped
        Ok(Json.toJson(dedupedFrontResult))
      case None => NotFound
    }
  }
}
