package model.commercial.events

import model.commercial.events.Eventbrite._
import org.joda.time.DateTime
import play.api.libs.json.Json

case class LiveEventMembershipInfo(id: String,
                                   url: String,
                                   mainImageUrl: String)

object LiveEventMembershipInfo {
  implicit val format = Json.format[LiveEventMembershipInfo]
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

  def apply(event: EBEvent, maybeEventInternalFeed: Option[LiveEventMembershipInfo] = None): LiveEvent =
    new LiveEvent(
      eventId = event.id,
      name = event.name,
      date = event.startDate,
      eventUrl = maybeEventInternalFeed map {_.url} getOrElse event.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      imageUrl = maybeEventInternalFeed map {_.mainImageUrl}
    )
}
