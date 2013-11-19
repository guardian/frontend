package model.commercial.soulmates

import model.commercial.{Segment, AdAgent}
import scala.util.Random
import common.ExecutionContexts
import scala.concurrent.Future

object SoulmatesAggregatingAgent {

  private val soulmatesAgents = Seq(SoulmatesMenAgent, SoulmatesWomenAgent)

  def refresh() {
    soulmatesAgents foreach (_.refresh())
  }

  def stop() {
    soulmatesAgents foreach (_.stop())
  }

  def sampleMembers(segment: Segment): Seq[Member] = {
    {
      for {
        man <- Random.shuffle(SoulmatesMenAgent.matchingAds(segment)).headOption
        woman <- Random.shuffle(SoulmatesWomenAgent.matchingAds(segment)).headOption
      } yield Random.shuffle(Seq(man, woman))
    } getOrElse Nil
  }

}

abstract class SoulmatesAgent(protected val membersLoaded: Future[Seq[Member]])
  extends AdAgent[Member] with ExecutionContexts {
  def refresh() {
    for {
      members <- membersLoaded
    } updateCurrentAds(members)
  }
}

object SoulmatesMenAgent extends SoulmatesAgent(SoulmatesApi.getMenMembers)

object SoulmatesWomenAgent extends SoulmatesAgent(SoulmatesApi.getWomenMembers)
