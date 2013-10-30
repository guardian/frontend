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
    val url = "test url"
    val description = "test description"
    val price = "test price"
    val spaces = 10

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

