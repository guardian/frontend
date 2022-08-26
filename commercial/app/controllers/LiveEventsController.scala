package commercial.controllers

import common.{ImplicitControllerExecutionContext, JsonComponent}
import model.Cached
import commercial.model.merchandise.events.LiveEventAgent
import play.api.mvc._

class LiveEventsController(liveEventAgent: LiveEventAgent, val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext
    with implicits.Requests {

  def getLiveEvent: Action[AnyContent] =
    Action { implicit request =>
      {
        for {
          id <- specificId
          event <- liveEventAgent.specificLiveEvent(id)
        } yield Cached(componentMaxAge) { JsonComponent.fromWritable(event) }
      } getOrElse Cached(componentNilMaxAge) { jsonFormat.nilResult }
    }
}
