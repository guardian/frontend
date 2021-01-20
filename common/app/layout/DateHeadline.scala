package layout

import org.joda.time.LocalDate
import org.joda.time.format.DateTimeFormat

sealed trait DateHeadline {
  val dateFormatString: String

  val dateTimeFormatString: String

  // TODO add a month endpoint and then make this non-optional
  val urlFragmentFormatString: Option[String]

  val day: LocalDate

  def displayString: String = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateFormatString))

  def dateTimeString: String = day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(dateTimeFormatString))

  def urlFragment: Option[String] =
    urlFragmentFormatString map { format =>
      day.toDateTimeAtStartOfDay.toString(DateTimeFormat.forPattern(format)).toLowerCase
    }
}

case class DayHeadline(day: LocalDate) extends DateHeadline {
  override val dateFormatString: String = "d MMMM yyyy"
  override val dateTimeFormatString: String = "yyyy-MM-dd"
  override val urlFragmentFormatString: Option[String] = Some("yyyy/MMM/dd")
}

case class MonthHeadline(day: LocalDate) extends DateHeadline {
  override val dateFormatString: String = "MMMM yyyy"
  override val dateTimeFormatString: String = "yyyy-MM"
  override val urlFragmentFormatString: Option[String] = None
}

object DateHeadline {
  def cardTimestampDisplay(dateHeadline: DateHeadline): FaciaCardTimestamp =
    dateHeadline match {
      case _: DayHeadline   => TimeTimestamp
      case _: MonthHeadline => DateTimestamp
    }
}
