package views.support

import org.joda.time.{Period, LocalDate}

object RegisterCountdown {
    val x = LocalDate.now()
    val lastDay = new LocalDate(2015, 4, 20)
    val interval = new Period(x, lastDay)
    val daysLeft = interval.getDays
}