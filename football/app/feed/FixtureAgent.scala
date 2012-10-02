package feed

import common.AkkaSupport
import pa.Fixture
import conf.FootballClient
import akka.util.Timeout
import akka.util.duration._

class FixtureAgent(competitionId: String) extends AkkaSupport {

  private val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refresh() { agent.sendOff { old => FootballClient.fixtures(competitionId) } }

  def await { try { agent.await(Timeout(5 seconds)) } catch { case _ => Unit } }

  def apply() = agent()
}
