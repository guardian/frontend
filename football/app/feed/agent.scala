package feed

import common.AkkaSupport
import pa.{ Result, Fixture }
import conf.FootballClient
import org.joda.time.DateMidnight
import model.Competition
import akka.util.Timeout
import common._
import play.api.Logger

trait HasCompetition {
  def competition: Competition
}

trait FixtureAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refreshFixtures() { agent.sendOff { old => FootballClient.fixtures(competition.id) } }

  def shutdownFixtures() { agent.close() }

  def awaitFixtures() { quietly(agent.await(Timeout(5000))) }

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.fixtureDate.toDateMidnight == date)
}

trait ResultAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[Result]](Nil)

  def refreshResults() {
    competition.startDate.foreach { startDate =>
      agent.sendOff { old => FootballClient.results(competition.id, startDate) }
    }
  }

  def shutdownResults() { agent.close() }

  def results = agent()

  def awaitResults() { quietly { agent.await(Timeout(5000)) } }

  def resultsOn(date: DateMidnight) = results.filter(_.date.toDateMidnight == date)
}

class CompetitionAgent(_competition: Competition) extends FixtureAgent with ResultAgent {

  private val agent = play_akka.agent(_competition)

  def competition = agent()

  def update(competition: Competition) { agent.update(competition) }

  def refresh() {
    refreshFixtures()
    refreshResults()
  }

  def shutdown() {
    shutdownFixtures()
    shutdownResults()
  }

  def await() {
    awaitFixtures()
    awaitResults()
  }
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}