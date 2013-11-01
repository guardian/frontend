package model.commercial.masterclasses

import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}
import org.joda.time.DateTime
import play.api.libs.json.JsValue

object MasterClass {
  private val datePattern: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")

  def apply(block: JsValue) = {
    val title = (block \ "title").as[String]
    val literalDate = (block \ "start_date").as[String]
    val startDate: DateTime = datePattern.parseDateTime(literalDate)
    val url = (block \ "url").as[String]
    val description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In feugiat molestie lectus id placerat. Sed rutrum, dui vitae tempus mollis, sem metus ultrices est."
    val price = "£400"


    val tickets = (block \\ "ticket") map { ticket =>
      val price = (ticket \ "display_price").as[String].toDouble
      new Ticket(price)
    } 

    new MasterClass(title, startDate, url, description, status, tickets.toList, capacity: Int)
  }
}

case class MasterClass(name: String, 
                       startDate: DateTime, 
                       url: String, 
                       description: String, 
                       status: String, 
                       tickets: List[Ticket],
                       capacity: Int) {
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
