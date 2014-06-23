package views.html.fragments

import com.github.nscala_time.time.Imports._

object selectDates {
  val yearFormatter = DateTimeFormat.forPattern("yy")

  def validCardYears(): Seq[(Int, String)] = {
    val now = DateTime.now
    for (yearsFromNow <- 0 until 20) yield {
      val date: DateTime = now + yearsFromNow.years
      (date.getYear, yearFormatter.print(date))
    }
  }

  def validCardMonths = 1 to 12
}
