package common

import org.joda.time.DateTime

import java.time.ZoneId

object Chronos {

  // Introduced in August 2021 by Pascal to help and support the migration from joda.time to java.time
  // Contains both helper functions implementing patterns emerging during the migration as well as more permanent
  // functions.

  // Do not attempt to simplify, until otherwise specified, the signatures of the functions.
  // The arguments are verbose type to help with reading and understanding. This will be simplified in due course.

  def toLocalDate(date: java.util.Date): java.time.LocalDate = {
    date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate()
  }

  def toDateTime(date: java.time.LocalDateTime): org.joda.time.DateTime = {
    DateTime.parse(date.toString)
  }

}
