package controllers.commercial

import common.{ExecutionContexts}
import model.NoCache
import model.commercial.events.LiveEventAgent
import play.api.mvc._

import scala.concurrent.Future

object LiveEventsController
  extends Controller
  with ExecutionContexts
  with implicits.Requests {

  def renderEvent = Action.async { implicit request =>
    specificId map { eventId =>
        Future {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          val selectedLiveEvents = LiveEventAgent.specificLiveEvent(eventId)

          selectedLiveEvents match {
            case Some(event) =>
              jsonFormat.result(views.html.liveevents.liveEvent(
                event,
                omnitureId,
                clickMacro))
            case None => NoCache(jsonFormat.nilResult)
          }
      }
    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult))
    }
  }
}
