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

trait SoulmatesAgent extends AdAgent[Member] with ExecutionContexts {

  protected def membersLoaded: Future[Seq[Member]]

  def refresh() {
    for {
      members <- membersLoaded
    } updateCurrentAds(members)
  }
}

object SoulmatesMenAgent extends SoulmatesAgent {
  protected def membersLoaded = SoulmatesApi.getMenMembers
}

object SoulmatesWomenAgent extends SoulmatesAgent {
  protected def membersLoaded = SoulmatesApi.getWomenMembers
}
