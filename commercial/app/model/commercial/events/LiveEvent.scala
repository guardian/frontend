package model.commercial.events

import model.commercial.events.Eventbrite._
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json.{JsPath, Reads}

case class LiveEventImage(eventId: String, mainImageUrl: String)
object LiveEventImage{

  implicit val liveEventImageReads: Reads[LiveEventImage] = (
    (JsPath \ "id").read[String] and
      (JsPath \ "mainImageUrl").read[String]
    )(LiveEventImage.apply _)

}


case class LiveEvent(eventId: String,
                     name: String,
                     date: DateTime,
                     eventUrl: String,
                     description: String,
                     status: String,
                     venue: EBVenue,
                     tickets: Seq[EBTicket],
                     imageUrl: Option[String]) extends EBTicketHandler with EBEventHandler

object LiveEvent {

  def apply(event: EBEvent, maybeEventImage: Option[LiveEventImage] = None): LiveEvent = {

    val maybeImageUrl =
      maybeEventImage match {
        case Some(eventImage) => Some(eventImage.mainImageUrl)
        case None => None
      }

    new LiveEvent(
      eventId = event.id,
      name = event.name,
      date = event.startDate,
      eventUrl = event.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      imageUrl = maybeImageUrl
    )
  }
}
