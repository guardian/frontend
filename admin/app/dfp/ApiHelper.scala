package dfp

import com.google.api.ads.admanager.axis.v202405._
import common.GuLogging
import org.joda.time.{DateTime => JodaDateTime, DateTimeZone}

private[dfp] object ApiHelper extends GuLogging {

  def toJodaTime(time: DateTime): JodaDateTime = {
    val date = time.getDate
    new JodaDateTime(
      date.getYear,
      date.getMonth,
      date.getDay,
      time.getHour,
      time.getMinute,
      time.getSecond,
      DateTimeZone.forID(time.getTimeZoneId),
    )
  }

  def toSeq[A](as: Array[A]): Seq[A] = Option(as) map (_.toSeq) getOrElse Nil
}
