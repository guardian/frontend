package model.commercial.events

import model.commercial.events.Eventbrite.{EBTicket, EBVenue, EBTicketHandler, EBEventHandler}

case class LiveEvent(id: String,
                     name: String,
                     date: String,
                     eventUrl: String,
                     description: String,
                     status: String,
                     venue: EBVenue,
                     tickets: Seq[EBTicket],
                     imageUrl: String) extends EBTicketHandler with EBEventHandler {
}
