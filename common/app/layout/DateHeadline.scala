package layout

import java.time.LocalDate
import java.time.format.DateTimeFormatter

sealed trait DateHeadline {
  val dateFormatString: String

  val dateTimeFormatString: String

  // TODO add a month endpoint and then make this non-optional
  val urlFragmentFormatString: Option[String]

  val day: LocalDate

  def displayString: String = day.atStartOfDay.format(DateTimeFormatter.ofPattern(dateFormatString))

  def dateTimeString: String = day.atStartOfDay.format(DateTimeFormatter.ofPattern(dateTimeFormatString))

  def urlFragment: Option[String] =
    urlFragmentFormatString map { format =>
      day.atStartOfDay.format(DateTimeFormatter.ofPattern(format)).toLowerCase
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
