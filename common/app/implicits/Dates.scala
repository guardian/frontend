package implicits

import org.joda.time.{Duration => JodaDuration, DateTime, DateMidnight, Days}
import org.scala_tools.time.Imports._
import org.joda.time.format.ISODateTimeFormat
import scala.concurrent.duration.Duration

trait Dates {
  implicit class RichDuration(duration: Duration) {
    def toJoda = new JodaDuration(duration.toMillis)
  }

  object Epoch {
    lazy val zero: DateMidnight = new DateMidnight(0)
    def day(dayOfEpoch: Int): DateMidnight = zero.plusDays(dayOfEpoch)
  }

  def today(): DateMidnight = DateMidnight.now()

  implicit class DateTime2SameDay(date: DateTime) {
    def sameDay(other: DateTime): Boolean =  {
      val thatDateSameZone = other.withZone(date.zone)
      date.getYear == thatDateSameZone.getYear && date.getDayOfYear == thatDateSameZone.getDayOfYear
    }
  }

  implicit class DateMidnight2DayOfEpoch(datetime: DateMidnight) {
    lazy val dayOfEpoch: Int = Days.daysBetween(Epoch.zero, datetime).getDays
  }

  implicit val dateOrdering: Ordering[DateMidnight] = Ordering[Long] on { _.getMillis }

  implicit class DateTimeWithExpiry(d: DateTime) {
    def age: Long = DateTime.now.getMillis - d.getMillis
    def isOlderThan(period: Period): Boolean = d.plus(period).isBeforeNow
  }

  //http://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
  private val HTTPDateFormat = DateTimeFormat.forPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'").withZone(DateTimeZone.UTC)

  implicit class DateTime2ToCommonDateFormats(date: DateTime) {
    lazy val toISODateTimeString: String = date.toString(ISODateTimeFormat.dateTime)
    lazy val toISODateTimeNoMillisString: String = date.toString(ISODateTimeFormat.dateTimeNoMillis)
    lazy val toHttpDateTimeString: String = date.toString(HTTPDateFormat)
  }

  implicit class String2Date(s: String) {
    lazy val parseHttpDateTimeString: DateTime = HTTPDateFormat.parseDateTime(s)
  }
}