package feed

import common.AkkaSupport
import pa.Fixture
import conf.FootballClient
import org.joda.time.DateMidnight
import model.Competition

trait HasCompetition {
  val competition: Competition
}

trait FixtureAgent extends AkkaSupport with HasCompetition {

  private val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refreshFixtures() { agent.sendOff { old => FootballClient.fixtures(competition.id) } }

  def shutdownFixtures() { agent.close() }

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.fixtureDate.toDateMidnight == date)
}

class CompetitionAgent(val competition: Competition) extends FixtureAgent {

  def refresh() {
    refreshFixtures()
  }

  def shutdown() {
    shutdownFixtures()
  }
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}

trait Competitions extends AkkaSupport {

  private val competitions = Seq(
    CompetitionAgent(Competition("100", "/football/premierleague", "Premier league", "Prem")),
    CompetitionAgent(Competition("101", "/football/championsleague", "Champions league", "np"))
  )

  def withFixturesOn(date: DateMidnight) = competitions.map { c =>
    c.competition.copy(fixtures = c.fixturesOn(date))
  }.filter(_.hasFixture)

  def startup() {
    competitions.foreach(_.refresh())
  }

  def shutDown() {
    competitions.foreach(_.shutdown())
  }
}

object Competitions extends Competitions