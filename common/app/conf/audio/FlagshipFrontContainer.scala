package conf.audio

import org.joda.time.DateTime
import org.joda.time.DateTimeConstants._
import org.joda.time.format.DateTimeFormat
import scala.concurrent.duration._
import conf.switches.Switches.FlagshipFrontContainerSwitch

object FlagshipFrontContainer {
  private val FrontContainerIds = Seq(
    "75ef80cd-2f3d-40d6-abf6-2021f88ece8e", //PROD
    "c57a70c8-a00a-4a15-93a2-035b9221622b"  //CODE
  )

  private val GoLiveDateTime = DateTimeFormat.forPattern("yyyy/MM/dd HH:mm").parseDateTime(s"2018/11/01 03:15")

  //The container should appear at 3:15 on Monday, and disappear at 3:15 on Saturday
  private val threeHoursFifteenMinutes: Long = (3.hours + 15.minutes).toMillis
  private def isWeekend(dateTime: DateTime): Boolean = {
    val day = dateTime.minus(threeHoursFifteenMinutes).getDayOfWeek
    day == SATURDAY || day == SUNDAY
  }


  def isFlagshipContainer(id: String): Boolean =
    FrontContainerIds.contains(id)

  def displayFlagshipContainer(now: DateTime = DateTime.now): Boolean =
    FlagshipFrontContainerSwitch.isSwitchedOn &&
      now.isAfter(GoLiveDateTime) &&
      !isWeekend(now)

  val AlbumArtUrl = "https://media.guim.co.uk/e1c686325e7a35c618126d749807a75450f6011e/0_0_800_800/500.png"

  object SubscriptionUrls {
    //TODO - update
    val apple: Option[String] = Some("https://itunes.apple.com/gb/podcast/today-in-focus/id1440133626?mt=2")
    val google: Option[String] = None
    val spotify: Option[String] = None
  }
}
