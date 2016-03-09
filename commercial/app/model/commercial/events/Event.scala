package model.commercial.events

import model.ImageElement
import org.apache.commons.lang.StringUtils
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat}
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import play.api.libs.json._
import play.api.libs.functional.syntax._

case class Ticket(price: Double, quantityTotal: Int, quantitySold: Int, donationEvent: Boolean)

object Ticket{

  def buildTicket(hidden: Boolean, donation: Boolean, valuePence: Double, quantityTotal: Int, quantitySold: Int): Option[Ticket] = {
    if (!hidden) {
      Some(Ticket(valuePence / 100, quantityTotal, quantitySold, donation))
    } else {
      None
    }
  }

  implicit val ticketReads: Reads[Option[Ticket]] = (
    (JsPath \ "hidden").read[Boolean] and
      (JsPath \ "donation").read[Boolean] and
      (JsPath \ "cost" \ "value").read[Double].orElse(Reads.pure(0.00)) and
      (JsPath \ "quantity_total").read[Int] and
      (JsPath \ "quantity_sold").read[Int]
    )(Ticket.buildTicket _)
}

case class Venue(name: Option[String] = None,
                 address: Option[String] = None,
                 address2: Option[String] = None,
                 city: Option[String] = None,
                 country: Option[String] = None,
                 postcode: Option[String] = None) {

  val description = Seq(name, city orElse country).flatten mkString ", "
}

object Venue {

  implicit val venueReads: Reads[Venue] = (
    (JsPath \ "name").readNullable[String] and
      (JsPath \ "address" \ "address_1").readNullable[String] and
      (JsPath \ "address" \ "address_2").readNullable[String] and
      (JsPath \ "address" \ "city").readNullable[String] and
      (JsPath \ "address" \ "country").readNullable[String] and
      (JsPath \ "address" \ "postal_code").readNullable[String]
    )(Venue.apply _)
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
                 capacity: Int,
                 firstParagraph: String,
                 tags: Seq[String] = Nil) extends TicketHandler

object Event{

  private def extractFirstParagraph(html: String) = {
    val doc: Document = Jsoup.parse(html)
    val firstParagraph: Option[Element] = Some(doc.select("p").first())
    firstParagraph match {
      case Some(p) => p.text
      case _ => ""
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
      event.capacity,
      event.firstParagraph,
      event.tags
    )
  }

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
      capacity,
      firstParagraph = extractFirstParagraph(description)
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
    )(Event.apply(_: String, _: String, _: DateTime, _:String, _: String, _: String, _: Venue, _: Seq[Option[Ticket]], _:Int))
}

case class Masterclass(id: String,
                       name: String,
                       startDate: DateTime,
                       url: String,
                       description: String,
                       status: String,
                       venue: Venue,
                       tickets: Seq[Ticket],
                       capacity: Int,
                       guardianUrl: String,
                       firstParagraph: String,
                       keywordIdSuffixes: Seq[String],
                       mainPicture: Option[ImageElement]) extends TicketHandler {

  lazy val readableDate = DateTimeFormat.forPattern("d MMMMM yyyy").print(startDate)

  lazy val truncatedFirstParagraph = StringUtils.abbreviate(firstParagraph, 250)
}

object Masterclass {
  private val guardianUrlLinkText = "Full course and returns information on the Masterclasses website"

  def apply(event: Event): Masterclass = {

    def extractGuardianUrl: String = {
      val doc = Jsoup.parse(event.description)
      val elements :Array[Element] = doc.select(s"a[href^=http://www.theguardian.com/]:contains($guardianUrlLinkText)")
          .toArray(Array.empty[Element])

      elements.headOption match {
        case Some(e) => e.attr("href")
        case _ => ""
      }
    }

    new Masterclass(
      id = event.id,
      name = event.name,
      startDate = event.startDate,
      url = event.url,
      description = event.description,
      status = event.status,
      venue = event.venue,
      tickets = event.tickets,
      capacity = event.capacity,
      guardianUrl = extractGuardianUrl,
      firstParagraph = event.firstParagraph,
      keywordIdSuffixes = Nil,
      mainPicture = None
    )
  }
}

trait TicketHandler{
  def tickets: Seq[Ticket]
  def status: String

  lazy val displayPrice = {
    val priceList = tickets.map(_.price).sorted.distinct
    if (priceList.size > 1) {
      val (low, high) = (priceList.head, priceList.last)
      f"£$low%,.2f to £$high%,.2f"
    } else f"£${priceList.head}%,.2f"
  }

  lazy val ratioTicketsLeft = 1 - (tickets.map(_.quantitySold).sum.toDouble / tickets.map(_.quantityTotal).sum)

  lazy val isOpen = { status == "live" }

}
