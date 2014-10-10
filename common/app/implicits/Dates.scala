package implicits

import org.joda.time.{Duration => JodaDuration, DateTime, LocalDate, Days}
import org.scala_tools.time.Imports._
import org.joda.time.format.ISODateTimeFormat
import scala.concurrent.duration.Duration

trait Dates {
  implicit class RichDuration(duration: Duration) {
    def toJoda = new JodaDuration(duration.toMillis)
  }

  object Epoch {
    lazy val zero: LocalDate = new LocalDate(0)
    def day(dayOfEpoch: Int): LocalDate = zero.plusDays(dayOfEpoch)
  }

  def today(): LocalDate = LocalDate.now()

  implicit class DateTime2SameDay(date: DateTime) {
    def sameDay(other: DateTime): Boolean =  {
      val dateUtc = date.withZone(DateTimeZone.UTC)
      val otherUtc = other.withZone(DateTimeZone.UTC)
      dateUtc.getYear == otherUtc.getYear && dateUtc.getDayOfYear == otherUtc.getDayOfYear
    }
  }

  implicit class LocalDate2DayOfEpoch(datetime: LocalDate) {
    lazy val dayOfEpoch: Int = Days.daysBetween(Epoch.zero, datetime).getDays
  }

  implicit val dateOrdering: Ordering[LocalDate] = Ordering[Long] on { _.toDateTimeAtStartOfDay.getMillis }

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