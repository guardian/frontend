package views.support

import conf.Switches.{TopAboveNavAdSlot728x90Switch, TopAboveNavAdSlot88x70Switch}
import model.MetaData

object Commercial {

  def topAboveNavAdSizes(metaData: MetaData): Map[String, Seq[String]] = {
    val isUKNetworkFront = metaData.id == "uk"
    Map(
      "mobile" -> Seq("1,1", "88,70", "728,90"),
      "desktop" -> {
        if (isUKNetworkFront) {
          if (TopAboveNavAdSlot728x90Switch.isSwitchedOn) {
            Seq("1,1", "728,90")
          } else if (TopAboveNavAdSlot88x70Switch.isSwitchedOn) {
            Seq("1,1", "88,70")
          } else {
            Seq("1,1", "900,250", "970,250")
          }
        } else {
          Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
        }
      }
    )
  }
}
