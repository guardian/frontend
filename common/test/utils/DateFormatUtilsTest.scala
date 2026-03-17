package utils

import org.joda.time.DateTime
import org.joda.time.DateTimeZone
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.ZonedDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.temporal.ChronoField

class DateFormatUtilsTest extends AnyFlatSpec with Matchers {

  "jodaUrlDateFormatUTC" should "format a date in yyyy/MMM/dd pattern" in {
    val date = new DateTime(2024, 9, 15, 10, 30, 0, DateTimeZone.UTC)
    DateFormatUtils.jodaUrlDateFormatUTC.print(date) should be("2024/Sep/15")
  }

  it should "parse September as 'Sep' and not 'Sept'" in {
    val parsed = DateFormatUtils.jodaUrlDateFormatUTC.parseDateTime("2024/Sep/15")
    parsed.getMonthOfYear should be(9)
    parsed.getDayOfMonth should be(15)
    parsed.getYear should be(2024)
  }

  it should "format a date in another month correctly" in {
    val date = new DateTime(2023, 3, 1, 0, 0, 0, DateTimeZone.UTC)
    DateFormatUtils.jodaUrlDateFormatUTC.print(date) should be("2023/Mar/01")
  }

  it should "apply UTC timezone regardless of the input timezone" in {
    val dateInNonUtc = new DateTime(2024, 9, 30, 23, 0, 0, DateTimeZone.forID("America/New_York"))
    // 23:00 New York time is 03:00 UTC the next day (UTC-4 in September)
    DateFormatUtils.jodaUrlDateFormatUTC.print(dateInNonUtc) should be("2024/Oct/01")
  }

  "javaUrlDateFormatUTC" should "format a date in yyyy/MMM/dd pattern" in {
    val date = ZonedDateTime.of(2024, 9, 15, 10, 30, 0, 0, ZoneOffset.UTC)
    DateFormatUtils.javaUrlDateFormatUTC.format(date) should be("2024/Sep/15")
  }

  it should "parse September as 'Sep' and not 'Sept'" in {
    val parsed = DateFormatUtils.javaUrlDateFormatUTC.parse("2024/Sep/15")
    parsed.get(ChronoField.MONTH_OF_YEAR) should be(9)
    parsed.get(ChronoField.DAY_OF_MONTH) should be(15)
    parsed.get(ChronoField.YEAR) should be(2024)
  }

  it should "format a date in another month correctly" in {
    val date = ZonedDateTime.of(2023, 3, 1, 0, 0, 0, 0, ZoneOffset.UTC)
    DateFormatUtils.javaUrlDateFormatUTC.format(date) should be("2023/Mar/01")
  }

  it should "apply UTC timezone regardless of the input timezone" in {
    val dateInNonUtc = ZonedDateTime.of(2024, 9, 30, 23, 0, 0, 0, ZoneId.of("America/New_York"))
    // 23:00 New York time is 03:00 UTC the next day (UTC-4 in September)
    DateFormatUtils.javaUrlDateFormatUTC.format(dateInNonUtc) should be("2024/Oct/01")
  }

}
