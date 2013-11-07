package model.commercial.masterclasses

import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}
import org.joda.time.DateTime
import play.api.libs.json.JsValue
import org.jsoup.Jsoup
import org.jsoup.nodes.{Element, Document}

object MasterClass {
  private val datePattern: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")

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
        val price = (ticket \ "display_price").as[String].toDouble
        new Ticket(price)
    }

    val doc: Document = Jsoup.parse(description)
    val elements: Array[Element] = doc.select("a[href^=http://www.theguardian.com/]:contains(Click here)").toArray map {_.asInstanceOf[Element]}

    val result: Array[MasterClass] = elements map { element =>
      new MasterClass(id.toString, title, startDate, url, description, status, tickets.toList, capacity, element.attr("href"))
    }

    return result.headOption
  }
}

case class MasterClass(id: String,
                       name: String,
                       startDate: DateTime,
                       url: String,
                       description: String,
                       status: String,
                       tickets: List[Ticket],
                       capacity: Int,
                       guardianUrl: String) {
  def isOpen = status == "Live"

  lazy val displayPrice = {
    val priceList = tickets.map(_.price).sorted.distinct
    if (priceList.size > 1) {
      val (low, high) = (priceList.head, priceList.last)
      "%1.2f to %1.2f".format(low, high)
    } else "%1.2f".format(priceList.head)
  }
}

case class Ticket(price: Double)
