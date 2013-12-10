package implicits

import org.joda.time.{DateTime, DateMidnight, Days}
import conf.Configuration

trait Dates {
  object Epoch {
    lazy val zero: DateMidnight = new DateMidnight(0)
    def day(dayOfEpoch: Int): DateMidnight = zero.plusDays(dayOfEpoch)
  }

  def today(): DateMidnight = DateMidnight.now()

  implicit class DateMidnight2DayOfEpoch(datetime: DateMidnight) {
    lazy val dayOfEpoch: Int = Days.daysBetween(Epoch.zero, datetime).getDays
  }

  implicit val dateOrdering: Ordering[DateMidnight] = Ordering[Long] on { _.getMillis }

  implicit class DateTimeWithExpiry(d: DateTime) {
    def age: Long = DateTime.now.getMillis - d.getMillis
  }
}