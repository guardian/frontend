package controllers.commercial

import common.{ExecutionContexts, Logging}
import model.commercial.liveevents.LiveEvent
import model.commercial.masterclasses.Ticket
import model.{Cached, NoCache}
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
          jsonFormat.result(views.html.liveevents.event(LiveEvent(
              id = "21554961470",
              title = "Guardian Live | EU referendum debate",
              date = "15 March 2016",
              location = "The London Palladium, London",
              description = "Should the UK remain part of the European Union? Join former deputy prime minister Nick Clegg, head of the Labour Yes campaign Alan Johnson, Eurosceptic peer and president of the Conservatives for Britain campaign Lord Nigel Lawson, and leader of the UK Independence Party Nigel Farage hosted by the Guardian's incoming political editor Anushka Asthana.",
              tickets = List(Ticket(
                  15.toDouble,
                  100,
                  95
              )),
              imageUrl = "https://media.guim.co.uk/b7c830bff5104b9ce9951928238fb09004d50335/0_0_1280_768/1280.jpg",
              eventUrl = "https://membership.theguardian.com/event/guardian-live-eu-referendum-debate-20860699915"
          ), omnitureId, clickMacro))
      }
    } getOrElse {
      Future.successful(NoCache(jsonFormat.nilResult))
    }
  }
}
