package commercial.controllers

import common.{ExecutionContexts, JsonComponent}
import model.Cached
import commercial.model.merchandise.events.LiveEventAgent
import play.api.mvc._

class LiveEventsController(liveEventAgent: LiveEventAgent)
  extends Controller
  with ExecutionContexts
  with implicits.Requests {

  def getLiveEvent = Action { implicit request =>
    {
      for {
        id <- specificId
        event <- liveEventAgent.specificLiveEvent(id)
      } yield Cached(componentMaxAge) { JsonComponent(event) }
    } getOrElse Cached(componentNilMaxAge) { jsonFormat.nilResult }
  }
}
