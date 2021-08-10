package common

import org.joda.time.DateTime

import java.text.SimpleDateFormat
import java.time.ZoneId
import java.util.TimeZone

// Introduced in August 2021 by Pascal to help and support the migration from joda.time to java.time
// Contains both helper functions implementing patterns emerging during the migration as well as more permanent
// functions.

// DO NOT attempt to simplify, until otherwise specified, the signatures of the functions.
// The arguments are verbose type to help with reading and understanding. This will be simplified in due course.

object Chronos {

  def toDateTime(date: java.time.LocalDateTime): org.joda.time.DateTime = {
    DateTime.parse(date.toString)
  }

  def toLocalDate(date: java.util.Date): java.time.LocalDate = {
    date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
  }

  def toLocalDateTime(date: java.util.Date): java.time.LocalDateTime = {
    date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
  }

  def toMilliSeconds(date: java.time.LocalDateTime): Long = {
    date.atZone(ZoneId.of("UTC")).toInstant().toEpochMilli()
  }

  def dateFormatter(pattern: String, timezone: TimeZone): SimpleDateFormat = {
    val dateTimeParser = new SimpleDateFormat(pattern)
    dateTimeParser.setTimeZone(timezone)
    dateTimeParser
  }

}
