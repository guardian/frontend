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
          jsonFormat.result(views.html.liveevents.liveEvent(selectedLiveEvents.head
          , omnitureId, clickMacro))
      }
    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult))
    }
  }
}
