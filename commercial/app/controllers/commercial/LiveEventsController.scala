package controllers.commercial

import common.{ExecutionContexts, Logging}
import model.NoCache
import model.commercial.events.LiveEventAgent
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object LiveEventsController
  extends Controller
  with ExecutionContexts
  with Logging
  with implicits.Collections
  with implicits.Requests {

  def renderEvent = MemcachedAction { implicit request =>
    specificId map { eventId =>
        Future {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")
          val selectedLiveEvents = LiveEventAgent.specificLiveEvents(specificIds)

          selectedLiveEvents.headOption match {
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
