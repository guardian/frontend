package conf.audio

import conf.switches.Switches.FlagshipFrontContainerSwitch

object FlagshipFrontContainer extends FlagshipContainer {
  override val containerIds = Seq(
    "75ef80cd-2f3d-40d6-abf6-2021f88ece8e", //PROD - OLD
    "c57a70c8-a00a-4a15-93a2-035b9221622b", //CODE - OLD
    // New as of 17/11/2022
    "5546dab9-da59-4e35-81dd-843fef1fd373", // PROD - UK
    "b0ebe405-db49-4a1d-9a5c-9d59c963cf99", // PROD - INT & Video & US
  )

  override val switch = FlagshipFrontContainerSwitch

  val AlbumArtUrl = "https://media.guim.co.uk/e1c686325e7a35c618126d749807a75450f6011e/0_0_800_800/500.png"
}
