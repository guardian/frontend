package conf.audio

import org.joda.time.DateTime
import org.joda.time.DateTimeConstants.{SATURDAY, SUNDAY}
import org.joda.time.format.DateTimeFormat
import conf.switches.Switches.FlagshipFrontContainer

object Flagship {
  private val FrontContainerIds = Seq(
    "75ef80cd-2f3d-40d6-abf6-2021f88ece8e", //PROD
    "c57a70c8-a00a-4a15-93a2-035b9221622b"  //CODE
  )

  private val GoLiveDateTime = DateTimeFormat.forPattern("yyyy/MM/dd HH:mm").parseDateTime("2018/11/01 06:00")

  def isFlagshipContainer(id: String): Boolean =
    FrontContainerIds.contains(id)

  def displayFlagshipContainer(now: DateTime = DateTime.now): Boolean =
    FlagshipFrontContainer.isSwitchedOn &&
      now.isAfter(GoLiveDateTime) &&
      now.getDayOfWeek != SATURDAY && now.getDayOfWeek != SUNDAY

  val AlbumArtUrl = "https://media.guim.co.uk/79284468f1b259db7d713dc24ea9af2a3f5c9937/0_0_800_800/500.png"
}
