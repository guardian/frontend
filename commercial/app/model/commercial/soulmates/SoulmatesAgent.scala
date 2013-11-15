package model.commercial.soulmates

import model.commercial.AdAgent
import scala.concurrent.Future
import common.ExecutionContexts

object SoulmatesAggregatingAgent {

  private val soulmatesAgents =
    Seq(SoulmatesMixedAgent, SoulmatesMenAgent, SoulmatesWomenAgent, SoulmatesGayAgent, SoulmatesLesbianAgent)

  def refresh() {
    soulmatesAgents foreach (_.refresh())
  }

  def stop() {
    soulmatesAgents foreach (_.stop())
  }

}

trait SoulmatesAgent extends AdAgent[Member] with ExecutionContexts {

  def getMembers: Future[Seq[Member]]

  def refresh() {
    for {
      members <- getMembers
    } updateCurrentAds(members)
  }

}

object SoulmatesMixedAgent extends SoulmatesAgent {
  def getMembers = SoulmatesApi.getMixedMembers()
}

object SoulmatesMenAgent extends SoulmatesAgent {
  def getMembers = SoulmatesApi.getMenMembers()
}

object SoulmatesWomenAgent extends SoulmatesAgent {
  def getMembers = SoulmatesApi.getWomenMembers()
}

object SoulmatesGayAgent extends SoulmatesAgent {
  def getMembers = SoulmatesApi.getGayMembers()
}

object SoulmatesLesbianAgent extends SoulmatesAgent {
  def getMembers = SoulmatesApi.getLesbianMembers()
}
