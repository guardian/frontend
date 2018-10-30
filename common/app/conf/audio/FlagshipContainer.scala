package conf.audio
import conf.switches.Switch
import org.joda.time.DateTime
import org.joda.time.DateTimeConstants.{SATURDAY, SUNDAY}
import org.joda.time.format.DateTimeFormat

import scala.concurrent.duration._

trait FlagshipContainer {

  private val GoLiveDateTime = DateTimeFormat.forPattern("yyyy/MM/dd HH:mm").parseDateTime("2018/11/01 03:15")

  //The container should appear at 03:15 on Monday, and disappear at 03:15 on Saturday
  private val threeHoursFifteenMinutes: Long = (3.hours + 15.minutes).toMillis
  private def isWeekend(dateTime: DateTime): Boolean = {
    val day = dateTime.minus(threeHoursFifteenMinutes).getDayOfWeek
    day == SATURDAY || day == SUNDAY
  }

  protected val switch: Switch

  protected val containerIds: Seq[String]

  def isFlagshipContainer(id: String): Boolean = containerIds.contains(id)

  def displayFlagshipContainer(now: DateTime = DateTime.now): Boolean =
    switch.isSwitchedOn &&
      now.isAfter(GoLiveDateTime) &&
      !isWeekend(now)
}
