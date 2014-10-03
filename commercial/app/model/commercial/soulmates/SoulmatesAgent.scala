package model.commercial.soulmates

import common.ExecutionContexts
import model.commercial.{MerchandiseAgent, Segment}

import scala.concurrent.Future
import scala.util.Random

object SoulmatesAggregatingAgent {

  private val soulmatesAgents = Seq(SoulmatesMenAgent, SoulmatesWomenAgent)

  def refresh() {
    soulmatesAgents foreach (_.refresh())
  }

  def sampleMembers(segment: Segment): Seq[Member] = {
    val women = Random.shuffle(SoulmatesWomenAgent.matchingMembers(segment))
    val men = Random.shuffle(SoulmatesMenAgent.matchingMembers(segment))
    if (women.isEmpty || men.isEmpty) {
      Nil
    } else {
      // we are looking for 6 random people, either
      // woman/man/woman/man/woman
      // man/woman/man/woman/man or
      val people = Random.shuffle(Seq(Random.shuffle(men), Random.shuffle(women)))
      people(0).zip(people(1)).flatMap{ case (p1, p2) => Seq(p1, p2) }.take(6)
    }
  }
}

trait SoulmatesAgent extends MerchandiseAgent[Member] with ExecutionContexts {

  def matchingMembers(segment: Segment): Seq[Member] = {
    getTargetedMerchandise(segment, default = Nil)(_.isTargetedAt(segment))
  }
    
  protected def membersLoaded: Future[Seq[Member]]

  def refresh() {
    for (members <- membersLoaded) updateAvailableMerchandise(members)
  }
}

object SoulmatesMenAgent extends SoulmatesAgent {
  protected def membersLoaded = MaleSoulmatesApi.loadAds()
}

object SoulmatesWomenAgent extends SoulmatesAgent {
  protected def membersLoaded = FemaleSoulmatesApi.loadAds()
}
