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

  case class EBResponse(pagination: EBPagination, events: Seq[EBEvent])

  object EBResponse {

    implicit val ebResponseReads: Reads[EBResponse] = (
      (JsPath \ "pagination").read[EBPagination] and
        (JsPath \ "events").read[Seq[EBEvent]]
      ) (EBResponse.apply _)
  }

  case class EBPagination(pageNumber: Int, pageCount: Int)

  object EBPagination {

    implicit val readsPagination: Reads[EBPagination] = (
      (JsPath \ "page_number").read[Int] and
        (JsPath \ "page_count").read[Int]
      ) (EBPagination.apply _)
  }

  case class EBEvent(id: String,
                     name: String,
                     startDate: DateTime,
                     url: String,
                     description: String,
                     imageUrl: Option[String],
                     status: String,
                     venue: EBVenue,
                     tickets: Seq[EBTicket],
                     capacity: Int
                    )

  object EBEvent {

    def apply(id: String,
              name: String,
              startDate: DateTime,
              url: String,
              description: String,
              status: String,
              venue: EBVenue,
              tickets: Seq[Option[EBTicket]],
              capacity: Int): EBEvent = {

      new EBEvent(
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
    implicit val eventReads: Reads[EBEvent] = (

      (JsPath \ "id").read[String] and
        (JsPath \ "name" \ "text").read[String] and
        (JsPath \ "start" \ "utc").read[DateTime] and
        (JsPath \ "url").read[String] and
        (JsPath \ "description" \ "html").read[String] and
        (JsPath \ "status").read[String] and
        (JsPath \ "venue").read[EBVenue] and
        (JsPath \ "ticket_classes").read[Seq[Option[EBTicket]]] and
        (JsPath \ "capacity").read[Int]
      ) (EBEvent.apply(_: String, _: String, _: DateTime, _: String, _: String, _: String, _: EBVenue, _: Seq[Option[EBTicket]], _: Int))

    implicit val eventsReads: Reads[Seq[EBEvent]] = new Reads[Seq[EBEvent]] {
      override def reads(json: JsValue): JsResult[Seq[EBEvent]] = {
        json match {
          case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.asOpt[EBEvent]))
          case _ => JsError(Seq(JsPath() -> Seq(ValidationError("error.expected.jsarray"))))
        }
      }
    }

    def buildEventWithImageSrc(event: EBEvent, src: String) = {
      new EBEvent(
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

  case class EBTicket(price: Double, quantityTotal: Int, quantitySold: Int)

  object EBTicket {

    def buildTicket(hidden: Boolean, donation: Boolean, valuePence: Double, quantityTotal: Int, quantitySold: Int): Option[EBTicket] = {
      if (hidden || donation) {
        None
      } else {
        Some(EBTicket(valuePence / 100, quantityTotal, quantitySold))
      }
    }

    implicit val ticketReads: Reads[Option[EBTicket]] = (
      (JsPath \ "hidden").read[Boolean] and
        (JsPath \ "donation").read[Boolean] and
        (JsPath \ "cost" \ "value").read[Double].orElse(Reads.pure(0.00)) and
        (JsPath \ "quantity_total").read[Int] and
        (JsPath \ "quantity_sold").read[Int]
      ) (EBTicket.buildTicket _)

    implicit val ticketsReads: Reads[Seq[EBTicket]] = new Reads[Seq[EBTicket]] {
      override def reads(json: JsValue): JsResult[Seq[EBTicket]] = {
        json match {
          case JsArray(jsValues) => JsSuccess(jsValues.flatMap(_.as[Option[EBTicket]]))
          case _ => JsError(Seq(JsPath() -> Seq(ValidationError("error.expected.jsarray"))))
        }
      }
    }
  }

  case class EBVenue(name: Option[String],
                     address: Option[String],
                     address2: Option[String],
                     city: Option[String],
                     country: Option[String],
                     postcode: Option[String]) {

    val description = Seq(name, city orElse country).flatten mkString ", "
  }

  object EBVenue {

    implicit val venueReads: Reads[EBVenue] = {

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
        ) (EBVenue.apply _)
    }
  }
  def parsePagesOfEvents(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[EBEvent]] = {

    feedMetaData.parseSwitch.isGuaranteedSwitchedOn flatMap { switchedOn =>
      if (switchedOn) {
        val start = currentTimeMillis
        feedContent map { body =>
          val responses = Json.parse(body).as[Seq[EBResponse]]
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

  trait EBTicketHandler {
    def tickets: Seq[EBTicket]

    lazy val displayPrice = {
      val priceList = tickets.map(_.price).sorted.distinct
      if (priceList.size > 1) {
        val (low, high) = (priceList.head, priceList.last)
        f"£$low%,.2f to £$high%,.2f"
      } else f"£${priceList.head}%,.2f"
    }

    lazy val ratioTicketsLeft = 1 - (tickets.map(_.quantitySold).sum.toDouble / tickets.map(_.quantityTotal).sum)
  }

  trait EBEventHandler {
    def status: String
    lazy val isOpen = { status == "live" }
  }
}
