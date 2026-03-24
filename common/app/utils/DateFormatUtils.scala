package utils

import org.joda.time.DateTimeZone
import org.joda.time.format.{DateTimeFormat => JodaDateTimeFormat, DateTimeFormatter => JodaDateTimeFormatter}

import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.util.Locale

object DateFormatUtils {
  // These are specialised formatters for any date used in a URL.
  // When this codebase was written (long before java 17), the default behaviour of the "MMM" pattern under a UK locale
  // was to parse and print September as "Sep". However since java 17 and above, the UK locale parses and print September as "Sept".
  // The easiest workaround to ensure our URLs are not affected is to specialise our date formatter to always use the US locale
  // In practice in production, our boxes aren't set to a UK locale, only our local machines are, but better be safe than sorry.
  val jodaUrlDateFormatUTC: JodaDateTimeFormatter =
    JodaDateTimeFormat
      .forPattern("yyyy/MMM/dd")
      .withZone(DateTimeZone.UTC)
      // forcing US locale here to ensure September is parsed as "Sep" and not "Sept" as it is since java 21 for a UK locale
      .withLocale(Locale.US)

  val javaUrlDateFormatUTC: DateTimeFormatter =
    DateTimeFormatter
      .ofPattern("yyyy/MMM/dd")
      .withZone(ZoneOffset.UTC)
      // forcing US locale here to ensure September is parsed as "Sep" and not "Sept" as it is since java 21 for a UK locale
      .withLocale(Locale.US)
}
