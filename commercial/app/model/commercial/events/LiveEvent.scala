package model.commercial.events

import model.commercial.events.Eventbrite._
import org.joda.time.DateTime
import play.api.data.validation.ValidationError
import play.api.libs.json._

case class LiveEventMembershipInfo(id: String,
                                   url: String,
                                   mainImageUrl: String)

object LiveEventMembershipInfo {
  implicit val format = Json.format[LiveEventMembershipInfo]

  // based on play.api.libs.json.LowPriorityDefaultReads.traversableReads
  implicit val formats = new Reads[Seq[LiveEventMembershipInfo]] {
    override def reads(json: JsValue): JsResult[Seq[LiveEventMembershipInfo]] = {
      json match {
        case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.asOpt[LiveEventMembershipInfo]))
        case _ => JsError(Seq(JsPath() -> Seq(ValidationError("error.expected.jsarray"))))
      }
    }
  }
}

case class LiveEvent(eventId: String,
                     name: String,
                     date: DateTime,
                     eventUrl: String,
                     description: String,
                     status: String,
                     venue: EBVenue,
                     tickets: Seq[EBTicket],
                     imageUrl: String) extends EBTicketHandler with EBEventHandler

object LiveEvent {

  def apply(event: EBEvent, eventMembershipInformation: LiveEventMembershipInfo): LiveEvent =
    new LiveEvent(
      eventId = event.id,
      name = event.name,
      date = event.startDate,
      eventUrl = eventMembershipInformation.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      imageUrl = eventMembershipInformation.mainImageUrl
    )
}
