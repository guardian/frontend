package implicits

import org.joda.time.{Days, DateTime}

trait Dates {
  object Epoch {
    lazy val zero: DateTime = new DateTime(0)
    def day(dayOfEpoch: Int): DateTime = zero.plusDays(dayOfEpoch).toDateMidnight.toDateTime
  }

  implicit class DateTime2DayOfEpoch(datetime: DateTime) {
    lazy val dayOfEpoch: Int = Days.daysBetween(Epoch.zero, datetime).getDays
  }

  implicit val dateOrdering: Ordering[DateTime] = Ordering[Long] on { _.getMillis }
}