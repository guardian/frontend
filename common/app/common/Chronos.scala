package common

import org.joda.time.DateTime

import java.time.{Instant, LocalDateTime, ZoneId}
import java.time.format.DateTimeFormatter

// Introduced in August 2021 by Pascal to help and support the migration from joda.time to java.time
// Contains both helper functions implementing patterns emerging during the migration as well as more permanent
// functions.

// DO NOT attempt to simplify, until otherwise specified, the signatures of the functions.
// The arguments are verbose type to help with reading and understanding. This will be simplified in due course.

object Chronos {

  // ------------------------------------------------
  // Conversions from java.time to joda.time

  def javaTimeLocalDateTimeToJodaDateTime(date: java.time.LocalDateTime): org.joda.time.DateTime = {
    DateTime.parse(date.toString)
  }

  // ------------------------------------------------
  // Conversions from joda.time to java.time

  def jodaDateTimeToJavaTimeDateTime(date: org.joda.time.DateTime): java.time.LocalDateTime = {
    LocalDateTime.ofInstant(
      Instant.ofEpochMilli(
        date
          .toInstant()
          .getMillis,
      ),
      ZoneId.systemDefault,
    )
  }

  def javaUtilDateToJavaTimeLocalDate(date: java.util.Date): java.time.LocalDate = {
    date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
  }

  // ------------------------------------------------
  // Conversions away from java.util.Date

  def javaUtilDateToJavaTimeLocalDateTime(date: java.util.Date): java.time.LocalDateTime = {
    date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
  }

  // ------------------------------------------------
  // Java Time helpers

  def toMilliSeconds(date: java.time.LocalDateTime): Long = {
    date.atZone(ZoneId.of("UTC")).toInstant().toEpochMilli()
  }

  def dateFormatter(pattern: String, timeZoneId: ZoneId): DateTimeFormatter = {
    val format = DateTimeFormatter.ofPattern(pattern)
    format.withZone(timeZoneId)
    format
  }
}
