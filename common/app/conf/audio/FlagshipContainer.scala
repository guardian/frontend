package conf.audio
import conf.switches.Switch

import scala.concurrent.duration._
import java.time.{Duration, ZonedDateTime, ZoneId, DayOfWeek}

trait FlagshipContainer {

  val londonTimezone = ZoneId.of("Europe/London")

  // Aug 17 at 3am
  private val tifOnHolsStart = ZonedDateTime.of(2019, 8, 17, 3, 15, 0, 0, londonTimezone)
  // Sep 2 at 2am
  private val tifOnHolsEnd = ZonedDateTime.of(2019, 9, 2, 3, 15, 0, 0, londonTimezone)

  //The container should appear at 03:15 on Monday, and disappear at 03:15 on Saturday
  private val threeHoursFifteenMinutes = Duration.ofHours(3) plus Duration.ofMinutes(15)
  private val weekend = Set(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY)
  private def isWeekend(dateTime: ZonedDateTime): Boolean =
    weekend(dateTime.minus(threeHoursFifteenMinutes).getDayOfWeek())

  protected val switch: Switch

  protected val containerIds: Seq[String]

  def isFlagshipContainer(id: String): Boolean = containerIds.contains(id)

  def displayFlagshipContainer(now: ZonedDateTime = ZonedDateTime.now(londonTimezone)): Boolean =
    switch.isSwitchedOn &&
      (now.isBefore(tifOnHolsStart) || now.isAfter(tifOnHolsEnd)) &&
      !isWeekend(now)
}
