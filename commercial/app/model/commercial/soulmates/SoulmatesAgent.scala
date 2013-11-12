package model.commercial.soulmates

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent

object SoulmatesAgent extends AdAgent[Member] with ExecutionContexts with Logging {

  def refresh() {
    for {
      members <- SoulmatesApi.getPopularMembers()
    } updateCurrentAds(members)
  }

}
