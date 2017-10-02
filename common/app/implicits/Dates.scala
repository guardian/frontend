package implicits

import com.gu.contentapi.client.model.v1.CapiDateTime
import common.Edition
import java.time.Instant
import org.joda.time.{DateTime, Days, LocalDate, Duration => JodaDuration}
import org.scala_tools.time.Imports._
import org.joda.time.format.ISODateTimeFormat

import scala.concurrent.duration.Duration

object Dates extends Dates

trait Dates {
  implicit class RichDuration(duration: Duration) {
    def toJoda: JodaDuration = new JodaDuration(duration.toMillis)
  }

  implicit class CapiRichDateTime(cdt: CapiDateTime) {
    def toJoda: DateTime = new DateTime(cdt.dateTime)
  }

  object Epoch {
    lazy val zero: LocalDate = new LocalDate(0)
    def day(dayOfEpoch: Int): LocalDate = zero.plusDays(dayOfEpoch)
  }

  def today(): LocalDate = LocalDate.now()

  def jodaToJavaInstant(date: DateTime): Instant = date.toDate.toInstant

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

  private lazy val DateTimeWithMillis = """.*\d\d:\d\d\.(\d+)[Z|\+].*""".r

  implicit class ISODateTimeStringNoMillis2DateTime(s: String) {
    lazy val parseISODateTime = s match {
      case DateTimeWithMillis(_) => ISODateTimeFormat.dateTime.withZone(Edition.defaultEdition.timezone).parseDateTime(s)
      case _ => ISODateTimeFormat.dateTimeNoMillis.withZone(Edition.defaultEdition.timezone).parseDateTime(s)
    }
  }

  implicit class String2Date(s: String) {
    lazy val parseHttpDateTimeString: DateTime = HTTPDateFormat.parseDateTime(s)
  }
}
