package controllers

import common._
import model._
import play.api.mvc._
import play.api.libs.concurrent.Akka
import play.api.Play.current

case class TimeLinePage(rootEvent: Event, events: Seq[Event]) extends Page(
  canonicalUrl = None,
  id = rootEvent.id,
  section = "global",
  webTitle = rootEvent.title,
  analyticsName = "GFE:event:" + rootEvent.id
)

object EventController extends Controller with Logging {

  def timeline(eventId: String) = Action {
    implicit request =>

      val promiseOfEvents = Akka.future(Event.mongo.eventChainFor(eventId))

      Async {
        promiseOfEvents.map { events =>
          val thisEvent = events.find(_.id == eventId)
          val rootEvent = events.headOption
          (rootEvent, thisEvent) match {
            case (Some(root), Some(event)) if root.id == event.id => Ok(views.html.timeline(TimeLinePage(root, events)))
            case (Some(root), Some(event)) => Redirect(routes.EventController.timeline(root.id).url + "#" + event.id)
            case _ => NotFound
          }
        }
      }
  }
}
