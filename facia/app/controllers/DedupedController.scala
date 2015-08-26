package controllers

import common.{ExecutionContexts, Logging}
import controllers.front.{FrontJsonFapiLive, FrontJsonFapi}
import layout.Front
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

trait DedupedController extends Controller with Logging with ExecutionContexts {

  val frontJsonFapi: FrontJsonFapi = FrontJsonFapiLive

  def getDedupedForPath(path: String) = Action.async { request =>
    frontJsonFapi.get(path).map {
      case Some(pressedFront) =>
        val removed = Front.fromPressedPageWithDeduped(pressedFront)._1._3

        Ok(Json.toJson(removed))
      case None => NotFound
    }
  }
}

object DedupedController extends DedupedController
