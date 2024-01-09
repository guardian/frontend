package football.datetime

import java.time.{ZonedDateTime, ZoneId, Instant}
import java.time.format.DateTimeFormatter
import org.joda.time.{DateTime}
import java.time.temporal.ChronoUnit

case class Interval(start: ZonedDateTime, end: ZonedDateTime) {
  def contains(dt: ZonedDateTime): Boolean = {
    // nb. don't check for equals end as Interval.contains (the joda time version, which this replaces) is not end-inclusive.
    (dt.isAfter(start) && dt.isBefore(end)) || dt.isEqual(start)
  }
}

object DateHelpers {
  val defaultFootballZoneId: ZoneId = ZoneId.of("Europe/London")

  def startOfDay(zdt: ZonedDateTime): ZonedDateTime = {
    zdt.truncatedTo(ChronoUnit.DAYS)
  }

  def sameDay(a: ZonedDateTime, b: ZonedDateTime): Boolean = {
    a.getYear == b.getYear && a.getDayOfYear == b.getDayOfYear
  }

  def asZonedDateTime(dt: DateTime): ZonedDateTime = {
    val instant = Instant.ofEpochMilli(dt.getMillis)
    val zoneId = ZoneId.of(dt.getZone.getID, ZoneId.SHORT_IDS)
    ZonedDateTime.ofInstant(instant, zoneId)
  }

  def asZonedDateTime(ld: java.time.LocalDate): ZonedDateTime = {
    ld.atStartOfDay(defaultFootballZoneId)
  }

  // Note format of 'yyyyMMdd' required!
  def parseLocalDate(year: String, month: String, day: String): java.time.LocalDate = {
    val formatter = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(DateHelpers.defaultFootballZoneId)
    java.time.LocalDate.parse(s"$year${month.capitalize}$day", formatter)
  }
}
