package model.commercial.soulmates

import model.commercial.{Segment, AdAgent}
import scala.concurrent.Future
import common.ExecutionContexts
import scala.util.Random

object SoulmatesAggregatingAgent {

  private val soulmatesAgents =
    Seq(SoulmatesMenAgent, SoulmatesWomenAgent)

  def refresh() {
    soulmatesAgents foreach (_.refresh())
  }

  def stop() {
    soulmatesAgents foreach (_.stop())
  }

  def sampleMembers(segment:Segment): Seq[Member] = {
    Seq(
      Random.shuffle(SoulmatesMenAgent.matchingAds(segment)).head,
      Random.shuffle(SoulmatesWomenAgent.matchingAds(segment)).head
    )
  }

}

trait SoulmatesAgent extends AdAgent[Member] with ExecutionContexts {

  protected def getMembers: Future[Seq[Member]]

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
