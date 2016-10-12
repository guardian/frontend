package commercial.controllers

import common.{ExecutionContexts, JsonComponent}
import commercial.controllers.util.{specificId, jsonFormat}
import model.{Cached, NoCache}
import model.commercial.events.LiveEventAgent
import play.api.mvc._
import util.{componentMaxAge, componentNilMaxAge}

import scala.concurrent.Future

class LiveEventsController(liveEventAgent: LiveEventAgent)
  extends Controller
  with ExecutionContexts
  with implicits.Requests {

  def renderEvent = Action.async { implicit request =>
    specificId map { eventId =>
        Future {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          val selectedLiveEvents = liveEventAgent.specificLiveEvent(eventId)

          selectedLiveEvents match {
            case Some(event) =>
              Cached(60)(jsonFormat.result(views.html.liveevents.liveEvent(
                event,
                omnitureId,
                clickMacro)))
            case None => NoCache(jsonFormat.nilResult.result)
          }
      }
    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult.result))
    }
  }

  def getLiveEvent = Action { implicit request =>
    {
      for {
        id <- specificId
        event <- liveEventAgent.specificLiveEvent(id)
      } yield Cached(componentMaxAge) { JsonComponent(event) }
    } getOrElse Cached(componentNilMaxAge) { jsonFormat.nilResult }
  }
}
