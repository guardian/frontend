package model.commercial.masterclasses

import model.ImageContainer
import org.apache.commons.lang.StringUtils
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormat, ISODateTimeFormat}
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import play.api.libs.json._

case class MasterClass(eventBriteEvent: EventbriteMasterClass, mainPicture: Option[ImageContainer])


object EventbriteMasterClass {
  private val guardianUrlLinkText = "Full course and returns information on the Masterclasses website"

  private val ignoredTags = Seq("masterclass", "short")

  def apply(block: JsValue): Option[EventbriteMasterClass] = {
    val id = (block \ "id").as[String]
    val name = (block \ "name" \ "text").as[String]
    val literalDate = (block \ "start" \ "utc").as[String]
    val startDate: DateTime = ISODateTimeFormat.dateTimeParser().parseDateTime(literalDate)
    val url = (block \ "url").as[String]
    val description = (block \ "description" \ "html").as[String]
    val status = (block \ "status").as[String]
    val capacity = (block \ "capacity").as[Int]

    // TODO: reinstate tags
    //    val tags = {
    //      for {
    //        rawTag <- (block \ "tags").as[String].split(",")
    //        tag = rawTag.toLowerCase.replaceAll("courses?", "").trim()
    //        if tag.nonEmpty && !ignoredTags.exists(tag.contains)
    //      } yield tag
    //    }.toSeq

    val tickets = {
      val maybeTickets = for (JsArray(ticketClasses) <- (block \ "ticket_classes").toOption) yield {
        for {
          ticketClass <- ticketClasses
          hidden <- (ticketClass \ "hidden").asOpt[Boolean]
          cost <- (ticketClass \ "cost").asOpt[JsValue]
          if !hidden
        } yield {
          val price = (cost \ "value").as[Int] / 100
          new Ticket(price)
        }
      }
      maybeTickets getOrElse Nil
    }.toList

    val doc: Document = Jsoup.parse(description)
    val elements: Array[Element] = doc.select(
      s"a[href^=http://www.theguardian.com/]:contains($guardianUrlLinkText)"
    ).toArray(Array.empty[Element])

    val paragraphs: Array[Element] = doc.select("p").toArray map {_.asInstanceOf[Element]}

    elements.headOption.map { element =>
      new EventbriteMasterClass(
        id,
        name,
        startDate,
        url,
        description,
        status,
        venue = Venue((block \ "venue").getOrElse(JsNull)),
        tickets,
        capacity,
        guardianUrl = element.attr("href"),
        firstParagraph = paragraphs.headOption.fold("")(_.text),
        tags = Nil
      )
    }
  }
}

case class EventbriteMasterClass(id: String,
                                 name: String,
                                 startDate: DateTime,
                                 url: String,
                                 description: String,
                                 status: String,
                                 venue: Venue,
                                 tickets: List[Ticket],
                                 capacity: Int,
                                 guardianUrl: String,
                                 firstParagraph: String = "",
                                 tags: Seq[String],
                                 keywordIdSuffixes: Seq[String] = Nil) {

  def isOpen = { status == "live" }

  lazy val displayPrice = {
    val priceList = tickets.map(_.price).sorted.distinct
    if (priceList.size > 1) {
      val (low, high) = (priceList.head, priceList.last)
      f"£$low%,.2f to £$high%,.2f"
    } else f"£${priceList.head}%,.2f"
  }

  lazy val readableDate = DateTimeFormat.forPattern("d MMMMM yyyy").print(startDate)

  lazy val truncatedFirstParagraph = StringUtils.abbreviate(firstParagraph, 250)
}

case class Ticket(price: Double)


object Venue {

  def apply(json: JsValue): Venue = {

    def eval(jsonField: JsLookupResult) = jsonField.asOpt[String].filterNot(_.length == 0)

    Venue(
      name = eval(json \ "name"),
      address = eval(json \ "address" \ "address_1"),
      address2 = eval(json \ "address" \ "address_2"),
      city = eval(json \ "address" \ "city"),
      country = eval(json \ "address" \ "country"),
      postcode = eval(json \ "address" \ "postal_code")
    )
  }
}

case class Venue(name: Option[String] = None,
                 address: Option[String] = None,
                 address2: Option[String] = None,
                 city: Option[String] = None,
                 country: Option[String] = None,
                 postcode: Option[String] = None) {

  val description = Seq(name, city orElse country).flatten mkString ", "
}
