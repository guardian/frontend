package views.support

import org.joda.time.{Period, LocalDate}

object RegisterCountdown {
    def daysLeft = {
        val x = LocalDate.now()
        val lastDay = new LocalDate(2015, 5, 7)
        val interval = new Period(x, lastDay)
        interval.toStandardDays.getDays
    }
}