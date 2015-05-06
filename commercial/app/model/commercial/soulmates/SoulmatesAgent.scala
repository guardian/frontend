package model.commercial.soulmates

import common.ExecutionContexts
import model.commercial.MerchandiseAgent

import scala.concurrent.Future
import scala.util.Random

object SoulmatesAggregatingAgent {

  private val soulmatesAgents = Seq(
    SoulmatesMenAgent,
    SoulmatesWomenAgent,
    SoulmatesBrightonAgent,
    SoulmatesNorthwestAgent,
    SoulmatesScotlandAgent,
    SoulmatesMatureAgent,
    SoulmatesYoungAgent
  )

  def refresh() {
    soulmatesAgents foreach (_.refresh())
  }

  def sampleMembers(members: Seq[Member]): Seq[Member] = {
    if (members.isEmpty) {
      Nil
    } else {
      // we are looking for 6 random people, either
      // woman/man/woman/man/woman/man or
      // man/woman/man/woman/man/woman
      val men = members.filter(_.gender == Man)
      val women = members.filter(_.gender == Woman)
      val people = Random.shuffle(Seq(Random.shuffle(men), Random.shuffle(women)))
      people(0).zip(people(1)).flatMap{ case (p1, p2) => Seq(p1, p2) }.take(6)
    }
  }
}

trait SoulmatesAgent extends MerchandiseAgent[Member] with ExecutionContexts {

  protected def membersLoaded: Future[Seq[Member]]

  def refresh() {
    for (members <- membersLoaded) updateAvailableMerchandise(members)
  }

  def members: Seq[Member] = available

  def sample(sampleSize: Int): Seq[Member] = Random.shuffle(available) take sampleSize
}

object SoulmatesMenAgent extends SoulmatesAgent {
  protected def membersLoaded = MaleSoulmatesFeed.loadAds()
}

object SoulmatesWomenAgent extends SoulmatesAgent {
  protected def membersLoaded = FemaleSoulmatesFeed.loadAds()
}

object SoulmatesBrightonAgent extends SoulmatesAgent {
  protected def membersLoaded = BrightonSoulmatesFeed.loadAds()
}

object SoulmatesNorthwestAgent extends SoulmatesAgent {
  protected def membersLoaded = NorthwestSoulmatesFeed.loadAds()
}

object SoulmatesScotlandAgent extends SoulmatesAgent {
  protected def membersLoaded = ScotlandSoulmatesFeed.loadAds()
}

object SoulmatesYoungAgent extends SoulmatesAgent {
  protected def membersLoaded = YoungSoulmatesFeed.loadAds()
}

object SoulmatesMatureAgent extends SoulmatesAgent {
  protected def membersLoaded = MatureSoulmatesFeed.loadAds()
}

object SoulmatesWestMidlandsAgent extends SoulmatesAgent {
  protected def membersLoaded = WestMidlandsSoulmatesFeed.loadAds()
}

object SoulmatesEastMidlandsAgent extends SoulmatesAgent {
  protected def membersLoaded = EastMidlandsSoulmatesFeed.loadAds()
}

object SoulmatesYorkshireAgent extends SoulmatesAgent {
  protected def membersLoaded = YorkshireSoulmatesFeed.loadAds()
}

object SoulmatesNorthEastAgent extends SoulmatesAgent {
  protected def membersLoaded = NortheastSoulmatesFeed.loadAds()
}

object SoulmatesEastAgent extends SoulmatesAgent {
  protected def membersLoaded = EastSoulmatesFeed.loadAds()
}

object SoulmatesSouthAgent extends SoulmatesAgent {
  protected def membersLoaded = SouthSoulmatesFeed.loadAds()
}

object SoulmatesSouthWestAgent extends SoulmatesAgent {
  protected def membersLoaded = SouthwestSoulmatesFeed.loadAds()
}

object SoulmatesWalesAgent extends SoulmatesAgent {
  protected def membersLoaded = WalesSoulmatesFeed.loadAds()
}
