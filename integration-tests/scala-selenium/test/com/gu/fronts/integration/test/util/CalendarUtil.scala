package com.gu.fronts.integration.test.util

import java.util.Calendar.DAY_OF_MONTH
import java.util.Calendar.MONTH
import java.util.Calendar.YEAR
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date

object CalendarUtil {

  def todayDayOfWeek(): String = {
    new SimpleDateFormat("EEEE").format(new Date())
  }

  def todayYearMonthDay(): Date = {
    val todayReset = today()
    val todayCal = today()
    todayReset.clear()
    todayReset.set(DAY_OF_MONTH, todayCal.get(DAY_OF_MONTH))
    todayReset.set(MONTH, todayCal.get(MONTH))
    todayReset.set(YEAR, todayCal.get(YEAR))
    todayReset.getTime
  }

  private def today(): Calendar = Calendar.getInstance
}