package model.commercial.soulmates

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent

object SoulmatesAggregatingAgent extends ExecutionContexts with Logging {

  private val soulmatesAgents = Seq(SoulmatesMixedAgent, SoulmatesMenAgent, SoulmatesWomenAgent)

  def refresh() {
    soulmatesAgents foreach (_.refresh)
  }

}

object SoulmatesMixedAgent extends AdAgent[Member] with ExecutionContexts with Logging {

  def refresh() {
    for {
      members <- SoulmatesApi.getMixedMembers()
    } updateCurrentAds(members)
  }

}

object SoulmatesMenAgent extends AdAgent[Member] with ExecutionContexts with Logging {

  def refresh() {
    for {
      members <- SoulmatesApi.getMenMembers()
    } updateCurrentAds(members)
  }

}

object SoulmatesWomenAgent extends AdAgent[Member] with ExecutionContexts with Logging {

  def refresh() {
    for {
      members <- SoulmatesApi.getWomenMembers()
    } updateCurrentAds(members)
  }

}
