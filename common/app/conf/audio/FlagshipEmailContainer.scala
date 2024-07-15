package conf.audio

import conf.switches.Switches.FlagshipEmailContainerSwitch
import model.pressed.{ItemKicker, TagKicker}
import com.gu.facia.api.utils.{TagKicker => FapiTagKicker}

object FlagshipEmailContainer extends FlagshipContainer {
  override val containerIds = Seq(
    "97f86ba7-4f14-43ec-bfb2-e149019b70f6", // PROD
    "7050d39f-7e84-4894-a69d-449c359b9d54", // CODE
  )

  override val switch = FlagshipEmailContainerSwitch

  val AlbumArtUrl = "https://media.guim.co.uk/4453029979df44db060528ed5f71ef19ada114eb/0_0_5000_3000/1000.jpg"

  object SeriesTag {
    val title = "Today in Focus"
    val url = "https://www.theguardian.com/news/series/todayinfocus"
    val id = "news/series/todayinfocus"
  }

  def kicker: TagKicker =
    ItemKicker.makeTagKicker(FapiTagKicker(name = SeriesTag.title, url = SeriesTag.url, id = SeriesTag.id))
}
