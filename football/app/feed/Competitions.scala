package feed

import common.AkkaSupport
import conf.FootballClient
import model.Competition
import akka.util.Timeout
import akka.util.duration._

trait Competitions extends AkkaSupport {

  val competionsWeAreinterestedIn = Seq(
    "100", //Premier league
    "101" //Npower Championship
  )

  private lazy val agent = play_akka.agent[Seq[Competition]](Nil)

  def refresh() = agent.sendOff {
    old =>
      {
        val allCompetitions = FootballClient.competitions map { c => Competition(c.id, c.name) }
        competionsWeAreinterestedIn.flatMap(id => allCompetitions.find(_.id == id))
      }
  }

  def all = agent()

  def warmup() {
    agent().orElse(
      try {
        agent.await(Timeout(5 seconds))
      } catch {
        case e => Nil
      }
    )
  }

  def startup() {
    //TODO scheduling
    refresh()
  }
}

object Competitions extends Competitions