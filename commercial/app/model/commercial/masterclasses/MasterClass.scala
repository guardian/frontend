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

    //val capacity: Int = (block \ "capacity").as[Int]
    //val attendees: Int = (block \ "num_attendee_rows").as[Int]
    val spaces = 8 //capacity - attendees

    val isOpen = ((block \ "status").as[String]).equals("Live")

    new MasterClass(title, startDate, url, description, price, spaces, isOpen)
  }
}

case class MasterClass(
  name: String,
  startDate: DateTime,
  url: String,
  description: String,
  price: String,
  spaces: Int,
  isOpen: Boolean
)

