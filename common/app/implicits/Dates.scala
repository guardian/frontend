package implicits

import org.joda.time.{ DateMidnight, Days }

trait Dates {
  object Epoch {
    lazy val zero: DateMidnight = new DateMidnight(0)
    def day(dayOfEpoch: Int): DateMidnight = zero.plusDays(dayOfEpoch)
  }

  implicit class DateMidnight2DayOfEpoch(datetime: DateMidnight) {
    lazy val dayOfEpoch: Int = Days.daysBetween(Epoch.zero, datetime).getDays
  }

  implicit val dateOrdering: Ordering[DateMidnight] = Ordering[Long] on { _.getMillis }
}