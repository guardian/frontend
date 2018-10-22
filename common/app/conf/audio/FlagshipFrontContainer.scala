package conf.audio

import org.joda.time.DateTime
import org.joda.time.DateTimeConstants._
import org.joda.time.format.DateTimeFormat
import conf.switches.Switches.FlagshipFrontContainerSwitch

object FlagshipFrontContainer {
  private val FrontContainerIds = Seq(
    "75ef80cd-2f3d-40d6-abf6-2021f88ece8e", //PROD
    "c57a70c8-a00a-4a15-93a2-035b9221622b"  //CODE
  )

  private val GoLiveDateTime = DateTimeFormat.forPattern("yyyy/MM/dd HH:mm").parseDateTime(s"2018/11/01 03:15")

  //The container should appear at 3:15 on Monday, and disappear at 3:15 on Saturday
  private def isWeekend(dateTime: DateTime): Boolean = {
    val day = dateTime.minusHours(3).minusMinutes(15).getDayOfWeek
    day == SATURDAY || day == SUNDAY
  }


  def isFlagshipContainer(id: String): Boolean =
    FrontContainerIds.contains(id)

  def displayFlagshipContainer(now: DateTime = DateTime.now): Boolean =
    FlagshipFrontContainerSwitch.isSwitchedOn &&
      now.isAfter(GoLiveDateTime) &&
      !isWeekend(now)

  //TODO - update
  val AlbumArtUrl = "https://media.guim.co.uk/79284468f1b259db7d713dc24ea9af2a3f5c9937/0_0_800_800/500.png"

  object SubscriptionUrls {
    //TODO - update
    val apple = "https://itunes.apple.com/gb/podcast/the-guardian-long-read/id587347784?mt=2"
    val google = "https://www.google.com/podcasts?feed=aHR0cHM6Ly93d3cudGhlZ3VhcmRpYW4uY29tL25ld3Mvc2VyaWVzL3RoZS1hdWRpby1sb25nLXJlYWQvcG9kY2FzdC54bWw%3D"
    val spotify = "https://open.spotify.com/show/0jG1HXr3tGoGorW1ieytRS"
  }
}
