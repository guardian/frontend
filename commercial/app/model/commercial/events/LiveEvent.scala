package model.commercial.events

import model.commercial.events.Eventbrite._
import org.joda.time.DateTime

case class LiveEvent(id: String,
                     name: String,
                     date: DateTime,
                     eventUrl: String,
                     description: String,
                     status: String,
                     venue: EBVenue,
                     tickets: Seq[EBTicket],
                     imageUrl: Option[String]) extends EBTicketHandler with EBEventHandler

object LiveEvent {

  def apply(event: EBEvent): LiveEvent = {

    new LiveEvent(
      id = event.id,
      name = event.name,
      date = event.startDate,
      eventUrl = event.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      imageUrl = None
    )
  }
}
