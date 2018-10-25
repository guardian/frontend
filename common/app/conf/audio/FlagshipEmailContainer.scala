package conf.audio
import org.joda.time.DateTime
import org.joda.time.DateTimeConstants.{MONDAY, SATURDAY, SUNDAY}
import org.joda.time.format.DateTimeFormat
import scala.concurrent.duration._
import conf.switches.Switches.FlagshipEmailContainerSwitch
import model.pressed.{ ItemKicker, TagKicker }
import com.gu.facia.api.utils.{ TagKicker => FapiTagKicker }

object FlagshipEmailContainer {
  private val EmailContainerIds = Seq(
    "97f86ba7-4f14-43ec-bfb2-e149019b70f6", //PROD
    "7050d39f-7e84-4894-a69d-449c359b9d54"  //CODE
  )

  private val GoLiveDateTime = DateTimeFormat.forPattern("yyyy/MM/dd HH:mm").parseDateTime("2018/11/01 03:15")

  //The container should appear at 03:15 on Monday, and disappear at 03:15 on Saturday
  private val threeHoursFifteenMinutes: Long = (3.hours + 15.minutes).toMillis
  private def isWeekend(dateTime: DateTime): Boolean = {
    val day = dateTime.minus(threeHoursFifteenMinutes).getDayOfWeek
    day == SATURDAY || day == SUNDAY
  }

  def isFlagshipContainer(id: String): Boolean =
    EmailContainerIds.contains(id)

  def displayFlagshipContainer(now: DateTime = DateTime.now): Boolean =
    FlagshipEmailContainerSwitch.isSwitchedOn &&
      now.isAfter(GoLiveDateTime) &&
      !isWeekend(now)

  val AlbumArtUrl = "https://media.guim.co.uk/26bb29790c63ac3374470d116e54a036581bbeda/0_0_2000_1200/500.png"

  object SeriesTag {
    val title = "Today in Focus"
    val url = "https://www.theguardian.com/news/series/todayinfocus"
    val id = "news/series/todayinfocus"
  }

  def kicker: TagKicker = ItemKicker.makeTagKicker(FapiTagKicker(name = SeriesTag.title, url= SeriesTag.url, id = SeriesTag.id))
}
