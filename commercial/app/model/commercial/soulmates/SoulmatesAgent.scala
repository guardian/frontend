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
    val women = Random.shuffle(SoulmatesWomenAgent.adsTargetedAt(segment))
    val men = Random.shuffle(SoulmatesMenAgent.adsTargetedAt(segment))
    if (women.isEmpty || men.isEmpty) {
      Nil
    } else {
      // we are looking for 5 random people, either
      // woman/man/woman/man/woman
      // man/woman/man/woman/man or
      val people = Random.shuffle(Seq(Random.shuffle(men), Random.shuffle(women)))
      people(0).zip(people(1)).flatMap{ case (p1, p2) => Seq(p1, p2) }.take(5)
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
  protected def membersLoaded = MaleSoulmatesApi.loadAds()
}

object SoulmatesWomenAgent extends SoulmatesAgent {
  protected def membersLoaded = FemaleSoulmatesApi.loadAds()
}
