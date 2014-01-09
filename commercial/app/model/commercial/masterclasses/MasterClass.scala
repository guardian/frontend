package model.commercial.masterclasses

import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}
import org.joda.time.DateTime
import play.api.libs.json.JsValue
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}
import model.commercial.{Segment, Ad}
import org.apache.commons.lang.StringUtils

object MasterClass {
  private val datePattern: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")
  private val guardianUrlLinkText = "Full course and returns information on the Masterclasses website"

//  private val guardianUrlLinkText = "Click here"

  def apply(block: JsValue): Option[MasterClass] = {
    val id = (block \ "id").as[Long]
    val title = (block \ "title").as[String]
    val literalDate = (block \ "start_date").as[String]
    val startDate: DateTime = datePattern.parseDateTime(literalDate)
    val url = (block \ "url").as[String]
    val description = (block \ "description").as[String]
    val status = (block \ "status").as[String]
    val capacity = (block \ "capacity").as[Int]

    val tickets = (block \\ "ticket") map {
      ticket =>
        val price = (ticket \ "display_price").as[String].replace(",", "").toDouble
        new Ticket(price)
    }

    val doc: Document = Jsoup.parse(description)
    val elements: Array[Element] = doc.select(s"a[href^=http://www.theguardian.com/]:contains($guardianUrlLinkText)").toArray map {_.asInstanceOf[Element]}

    val paragraphs: Array[Element] = doc.select("p").toArray map {_.asInstanceOf[Element]}

    val result: Array[MasterClass] = elements map { element =>
        new MasterClass(id.toString,
          title,
          startDate,
          url,
          description,
          status,
          Venue(block \ "venue"),
          tickets.toList,
          capacity,
          element.attr("href"),
          paragraphs.head.text)
    }

    result.headOption
  }
}

case class MasterClass(id: String,
                       name: String,
                       startDate: DateTime,
                       url: String,
                       description: String,
                       status: String,
                       venue: Venue,
                       tickets: List[Ticket],
                       capacity: Int,
                       guardianUrl: String,
                       firstParagraph: String = "") extends Ad {

  def isOpen = {status == "Live"}

  lazy val displayPrice = {
    val priceList = tickets.map(_.price).sorted.distinct
    if (priceList.size > 1) {
      val (low, high) = (priceList.head, priceList.last)
      f"$low%,.2f to $high%,.2f"
    } else f"${priceList.head}%,.2f"
  }

  def isTargetedAt(segment: Segment) = segment.context.isInSection("music")

  private val readableDateFormat = DateTimeFormat.forPattern("d MMMMM yyyy")

  def readableDate = readableDateFormat.print(startDate)

  val truncatedFirstParagraph = StringUtils.abbreviate(firstParagraph, 250)
}

case class Ticket(price: Double)


object Venue {

  def apply(json: JsValue): Venue = {

    def eval(jsonField: JsValue) = jsonField.asOpt[String].filterNot(_.length == 0)

    Venue(
      name = eval(json \ "name"),
      address = eval(json \ "address"),
      address2 = eval(json \ "address_2"),
      city = eval(json \ "city"),
      country = eval(json \ "country"),
      postcode = eval(json \ "postal_code")
    )
  }
}

case class Venue(name: Option[String] = None,
                 address: Option[String] = None,
                 address2: Option[String] = None,
                 city: Option[String] = None,
                 country: Option[String] = None,
                 postcode: Option[String] = None) {

  val description = Seq(name, address, address2, city, country, postcode).flatten.mkString(", ")
}
