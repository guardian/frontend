package model.commercial.masterclasses

import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}
import org.joda.time.DateTime
import java.util.Date
import play.api.libs.json.JsValue

object MasterClass {
  private val datePattern: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss")

  def apply(block: JsValue) = {
    val title = (block \ "title").as[String]
    val literalDate = (block \ "start_date").as[String]
    val startDate: DateTime = datePattern.parseDateTime(literalDate)

    new MasterClass(title, startDate.toDate)
  }
}

case class MasterClass(name: String, startDate: Date)

