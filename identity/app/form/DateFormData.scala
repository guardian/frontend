package form

import org.scala_tools.time.Imports._
import scala.util._
import play.api.data.Forms._
import scala.util.Success
import scala.util.Failure
import play.api.i18n.{Messages, I18nSupport}

trait DateMapping extends I18nSupport {

  val dateMapping = mapping(
    "year" -> optional(number(min = 1800, max = DateTime.now.getYear)),
    "month" -> optional(number(min = 1, max = 12)),
    "day" -> optional(number(min = 1, max = 31))
  )(DateFormData.apply)(DateFormData.unapply) verifying (
    Messages("error.date"),
    { dateData => dateData.isValid }
  )

}

case class DateFormData(year: Option[Int], month: Option[Int], day: Option[Int]){

  lazy val dateTime: Option[DateTime] = {
    val date = for{
      y <- year
      m <- month
      d <- day
    } yield tryDate(y, m, d)
    date.flatten
  }

  lazy val isValid: Boolean = (year, month, day) match {
    case (None, None, None) => true

    case (Some(y), Some(m), Some(d)) =>
      dateTime exists {_.isBeforeNow}

    case _ => false
  }

  private def tryDate(y: Int, m: Int, d: Int): Option[DateTime] = {
    Try{ new LocalDate(y, m, d).toDateTimeAtStartOfDay}.toOption
  }
}

object DateFormData {
  def apply(date: Option[DateTime]): DateFormData = DateFormData(
    date map {_.getYear},
    date map {_.getMonthOfYear},
    date map {_.getDayOfMonth}
  )
}
