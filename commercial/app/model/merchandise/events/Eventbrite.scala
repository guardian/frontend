package commercial.model.merchandise.events

import java.lang.System._

import commercial.model.feeds.{FeedMetaData, MissingFeedException, ParsedFeed, SwitchOffException}
import common.GuLogging
import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json._
import commercial.model.readsSeq

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._
import scala.util.control.NonFatal

object Eventbrite extends GuLogging {

  case class Response(pagination: Pagination, events: Seq[Event])

  case class Pagination(pageNumber: Int, pageCount: Int)

  case class Event(
      id: String,
      name: String,
      startDate: DateTime,
      url: String,
      description: String,
      imageUrl: Option[String],
      status: String,
      venue: Venue,
      tickets: Seq[Ticket],
      capacity: Int,
  )

  case class Ticket(hidden: Boolean, donation: Boolean, price: Double, quantityTotal: Int, quantitySold: Int)

  case class Venue(
      name: Option[String],
      address: Option[String],
      address2: Option[String],
      city: Option[String],
      country: Option[String],
      postcode: Option[String],
  ) {

    val description = Seq(name, city orElse country).flatten mkString ", "
  }

  implicit val jodaDateTimeFormats: Format[DateTime] =
    Format(JodaReads.jodaDateReads("yyyy-MM-dd'T'HH:mm:ssZ"), JodaWrites.jodaDateWrites("dd MMM yyyy"))

  implicit val ticketReads: Reads[Ticket] = (
    (JsPath \ "hidden").read[Boolean] and
      (JsPath \ "donation").read[Boolean] and
      (JsPath \ "cost" \ "value").read[Double].map(pence => pence / 100) and
      (JsPath \ "quantity_total").read[Int] and
      (JsPath \ "quantity_sold").read[Int]
  )(Ticket.apply _)

  implicit val ticketWrites: Writes[Ticket] = Json.writes[Ticket]

  implicit val venueReads: Reads[Venue] = (
    (JsPath \ "name").readNullable[String] and
      (JsPath \ "address" \ "address_1").readNullable[String] and
      (JsPath \ "address" \ "address_2").readNullable[String] and
      (JsPath \ "address" \ "city").readNullable[String] and
      (JsPath \ "address" \ "country").readNullable[String] and
      (JsPath \ "address" \ "postal_code").readNullable[String]
  )(Venue.apply _)

  implicit val venueWrites: Writes[Venue] = Json.writes[Venue]

  implicit val eventReads: Reads[Event] = (
    (JsPath \ "id").read[String] and
      (JsPath \ "name" \ "text").read[String] and
      (JsPath \ "start" \ "utc").read[DateTime] and
      (JsPath \ "url").read[String] and
      (JsPath \ "description" \ "html").read[String] and
      (JsPath \ "image_url").readNullable[String] and // not present in the JSON; see usages of `buildEventWithImageSrc`
      (JsPath \ "status").read[String] and
      (JsPath \ "venue").read[Venue] and
      (JsPath \ "ticket_classes")
        .read[Seq[Ticket]](readsSeq[Ticket])
        .map(excludeFreeAndHiddenTickets) and // we want to filter out donation and hidden tickets here
      (JsPath \ "capacity").read[Int]
  )(Event.apply _)

  implicit val eventWrites: Writes[Event] = Json.writes[Event]

  def excludeFreeAndHiddenTickets(tickets: Seq[Ticket]): Seq[Ticket] =
    tickets.filterNot(ticket => ticket.hidden || ticket.donation)

  implicit val paginationReads: Reads[Pagination] = (
    (JsPath \ "page_number").read[Int] and
      (JsPath \ "page_count").read[Int]
  )(Pagination.apply _)

  implicit val responseReads: Reads[Response] = (
    (JsPath \ "pagination").read[Pagination] and
      (JsPath \ "events").read[Seq[Event]](readsSeq[Event])
  )(Response.apply _)

  def buildEventWithImageSrc(event: Event, src: String): Event = event.copy(imageUrl = Some(src))

  def parsePagesOfEvents(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[Event]] = {

    feedMetaData.parseSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val responses = Json.parse(body).as[Seq[Response]]
          val events = responses flatMap { _.events }

          Future(ParsedFeed(events, Duration(currentTimeMillis - start, MILLISECONDS)))
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

    val displayPriceRange: Option[String] = {

      def determinePriceRange: String = {

        def format(price: Double): String = f"£$price%,.2f"

        val prices: Seq[Double] = tickets.map(_.price)
        val (low, high) = (prices.min, prices.max)

        if (low == high)
          format(high)
        else
          s"${format(low)} to ${format(high)}"
      }

      if (tickets.isEmpty)
        None
      else
        Some(determinePriceRange)
    }

    val ratioTicketsLeft: Option[Double] =
      if (tickets.isEmpty)
        None
      else
        Some(1 - (tickets.map(_.quantitySold).sum.toDouble / tickets.map(_.quantityTotal).sum))
  }

  trait EventHandler {
    def status: String
    val isOpen = { status == "live" }
  }
}
