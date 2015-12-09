package controllers

import common.{Edition, ExecutionContexts, Logging}
import controllers.front.{FrontJsonFapi, FrontJsonFapiLive}
import layout.Front
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

trait DedupedController extends Controller with Logging with ExecutionContexts {

  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiLive

  def getDedupedForPath(path: String) = Action.async { implicit request =>
    frontJsonFapi.get(path).map {
      case Some(pressedFront) =>
        val ((_, _, dedupedFrontResult), _) =
          Front.fromPressedPageWithDeduped(pressedFront, Edition(request))
        Ok(Json.toJson(dedupedFrontResult))
      case None => NotFound
    }
  }
}

object DedupedController extends DedupedController
