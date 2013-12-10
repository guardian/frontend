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

  def sampleMembers(segment: Segment): List[Member] = {
    val women = Random.shuffle(SoulmatesWomenAgent.adsTargetedAt(segment))
    val men = Random.shuffle(SoulmatesMenAgent.adsTargetedAt(segment))
    if (women.isEmpty || men.isEmpty) {
      Nil
    } else {
      Random.shuffle(List(women.head, men.head)) ++ Random.shuffle(men.tail.take(2) ++ women.tail.take(2)).take(3)
    }
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
