package model.commercial.events

import java.lang.System._

import commercial.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.{ExecutionContexts, Logging}
import org.joda.time.DateTime
import play.api.data.validation.ValidationError
import play.api.libs.functional.syntax._
import play.api.libs.json._

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.control.NonFatal

object Eventbrite extends ExecutionContexts with Logging {

  case class Response(pagination: Pagination, events: Seq[Event])

  object Response {

    implicit val ebResponseReads: Reads[Response] = (
      (JsPath \ "pagination").read[Pagination] and
        (JsPath \ "events").read[Seq[Event]]
      ) (Response.apply _)
  }

  case class Pagination(pageNumber: Int, pageCount: Int)

  object Pagination {

    implicit val readsPagination: Reads[Pagination] = (
      (JsPath \ "page_number").read[Int] and
        (JsPath \ "page_count").read[Int]
      ) (Pagination.apply _)
  }

  case class Event(id: String,
                   name: String,
                   startDate: DateTime,
                   url: String,
                   description: String,
                   imageUrl: Option[String],
                   status: String,
                   venue: Venue,
                   tickets: Seq[Ticket],
                   capacity: Int
                    )

  object Event {

    def apply(id: String,
              name: String,
              startDate: DateTime,
              url: String,
              description: String,
              status: String,
              venue: Venue,
              tickets: Seq[Option[Ticket]],
              capacity: Int): Event = {

      new Event(
        id,
        name,
        startDate,
        url,
        description,
        None,
        status,
        venue,
        tickets.flatten,
        capacity
      )
    }

    private lazy val dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
    implicit val jodaDateTimeReads: Reads[DateTime] = Reads.jodaDateReads(dateFormat)
    implicit val eventReads: Reads[Event] = (

      (JsPath \ "id").read[String] and
        (JsPath \ "name" \ "text").read[String] and
        (JsPath \ "start" \ "utc").read[DateTime] and
        (JsPath \ "url").read[String] and
        (JsPath \ "description" \ "html").read[String] and
        (JsPath \ "status").read[String] and
        (JsPath \ "venue").read[Venue] and
        (JsPath \ "ticket_classes").read[Seq[Option[Ticket]]] and
        (JsPath \ "capacity").read[Int]
      ) (Event.apply(_: String, _: String, _: DateTime, _: String, _: String, _: String, _: Venue, _: Seq[Option[Ticket]], _: Int))

    implicit val eventsReads: Reads[Seq[Event]] = new Reads[Seq[Event]] {
      override def reads(json: JsValue): JsResult[Seq[Event]] = {
        json match {
          case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.asOpt[Event]))
          case _ => JsError(Seq(JsPath() -> Seq(ValidationError("error.expected.jsarray"))))
        }
      }
    }

    def buildEventWithImageSrc(event: Event, src: String) = {
      new Event(
        event.id,
        event.name,
        event.startDate,
        event.url,
        event.description,
        Some(src),
        event.status,
        event.venue,
        event.tickets,
        event.capacity
      )
    }
  }

  case class Ticket(price: Double, quantityTotal: Int, quantitySold: Int)

  object Ticket {

    def buildTicket(hidden: Boolean, donation: Boolean, valuePence: Double, quantityTotal: Int, quantitySold: Int): Option[Ticket] = {
      if (hidden || donation) {
        None
      } else {
        Some(Ticket(valuePence / 100, quantityTotal, quantitySold))
      }
    }

    implicit val ticketReads: Reads[Option[Ticket]] = (
      (JsPath \ "hidden").read[Boolean] and
        (JsPath \ "donation").read[Boolean] and
        (JsPath \ "cost" \ "value").read[Double].orElse(Reads.pure(0.00)) and
        (JsPath \ "quantity_total").read[Int] and
        (JsPath \ "quantity_sold").read[Int]
      ) (Ticket.buildTicket _)

    implicit val ticketsReads: Reads[Seq[Ticket]] = new Reads[Seq[Ticket]] {
      override def reads(json: JsValue): JsResult[Seq[Ticket]] = {
        json match {
          case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.as[Option[Ticket]]))
          case _ => JsError(Seq(JsPath() -> Seq(ValidationError("error.expected.jsarray"))))
        }
      }
    }

    implicit val ticketWrites: Writes[Ticket] = Json.writes[Ticket]
  }

  case class Venue(name: Option[String],
                   address: Option[String],
                   address2: Option[String],
                   city: Option[String],
                   country: Option[String],
                   postcode: Option[String]) {

    val description = Seq(name, city orElse country).flatten mkString ", "
  }

  object Venue {

    implicit val venueReads: Reads[Venue] = {

      def captureEmptyString(x: Reads[Option[String]]): Reads[Option[String]] = {
        x map (el => if (el.getOrElse("").length == 0) None else el)
      }

      (
        captureEmptyString((JsPath \ "name").readNullable[String]) and
          captureEmptyString((JsPath \ "address" \ "address_1").readNullable[String]) and
          captureEmptyString((JsPath \ "address" \ "address_2").readNullable[String]) and
          captureEmptyString((JsPath \ "address" \ "city").readNullable[String]) and
          captureEmptyString((JsPath \ "address" \ "country").readNullable[String]) and
          captureEmptyString((JsPath \ "address" \ "postal_code").readNullable[String])
        ) (Venue.apply _)
    }

    implicit val venueWrites: Writes[Venue] = Json.writes[Venue]
  }
  def parsePagesOfEvents(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[Event]] = {

    feedMetaData.parseSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val responses = Json.parse(body).as[Seq[Response]]
          val events = responses flatMap {_.events}

          Future(ParsedFeed(
            events,
            Duration(currentTimeMillis - start, MILLISECONDS))
          )
        } getOrElse {
          Future.failed(MissingFeedException(feedMetaData.name))
        }
      } else {
        Future.failed(SwitchOffException(feedMetaData.parseSwitch.name))
      }
    } recoverWith {
      case NonFatal(e) => Future.failed(e)
    }
  }

  trait TicketHandler {
    def tickets: Seq[Ticket]

    lazy val displayPrice = {
      val priceList = tickets.map(_.price).sorted.distinct
      if (priceList.size > 1) {
        val (low, high) = (priceList.head, priceList.last)
        f"£$low%,.2f to £$high%,.2f"
      } else f"£${priceList.head}%,.2f"
    }

    lazy val ratioTicketsLeft = 1 - (tickets.map(_.quantitySold).sum.toDouble / tickets.map(_.quantityTotal).sum)
  }

  trait EventHandler {
    def status: String
    lazy val isOpen = { status == "live" }
  }
}
