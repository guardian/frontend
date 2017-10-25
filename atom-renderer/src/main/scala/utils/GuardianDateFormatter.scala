package com.gu.contentatom.renderer
package utils

import java.time.{ Instant, LocalDateTime, ZoneId }
import java.time.format.DateTimeFormatter

object GuardianDateFormatter {

  private val guardianFormat = DateTimeFormatter.ofPattern("d MMMM uuuu")

  private val machineFormat = DateTimeFormatter.ISO_LOCAL_DATE_TIME

  private def longToDate(date: Long): LocalDateTime =
    LocalDateTime.ofInstant(Instant.ofEpochMilli(date), ZoneId.systemDefault())

  def apply(date: Long): String = 
    longToDate(date).format(guardianFormat)

  def apply(date: String): String =
    LocalDateTime.parse(date).format(guardianFormat)

  def apply(date: LocalDateTime): String =
    date.format(guardianFormat)

  def toMachineValue(date: Long): String =
    machineFormat.format(longToDate(date))

}