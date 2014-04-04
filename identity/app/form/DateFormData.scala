package form

import org.scala_tools.time.Imports._
import scala.util._
import play.api.data.Forms._
import scala.util.Success
import scala.util.Failure
import scala.Some
import play.api.i18n.Messages

trait DateMapping {

  val dateMapping = mapping(
    "year" -> optional(number(min = 1800, max = DateTime.now.getYear)),
    "month" -> optional(number(min = 1, max = 12)),
    "day" -> optional(number(min = 1, max = 31))
  )(DateFormData.apply)(DateFormData.unapply) verifying (
    Messages("error.date"),
    { _.isValid }
  )

}

case class DateFormData(year: Option[Int], month: Option[Int], day: Option[Int]){

  lazy val (isValid, dateTime): (Boolean, Option[DateTime] )= (year, month, day) match {
    case (None, None, None) => (true, None)

    case (Some(y), Some(m), Some(d)) => Try{ new LocalDate(y, m, d).toDateTimeAtStartOfDay} match {
      case Failure(e) => (false, None)

      case Success(date: DateTime) => if(date.isAfterNow) (false, Some(date)) else (true, Some(date))
    }

    case _ => (false, None)
  }
}

object DateFormData {
  def apply(date: Option[DateTime]): DateFormData = DateFormData(
    date map {_.getYear},
    date map {_.getMonthOfYear},
    date map {_.getDayOfMonth}
  )
}