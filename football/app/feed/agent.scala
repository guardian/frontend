package feed

import common.AkkaSupport
import pa.{ Result, Fixture }
import conf.FootballClient
import org.joda.time.DateMidnight
import model.Competition
import scala.concurrent.ops._
import akka.util.Duration
import java.util.concurrent.TimeUnit._
import akka.actor.Cancellable

trait HasCompetition {
  def competition: Competition
}

trait FixtureAgent extends AkkaSupport with HasCompetition {

  private val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refreshFixtures() { agent.sendOff { old => FootballClient.fixtures(competition.id) } }

  def shutdownFixtures() { agent.close() }

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.fixtureDate.toDateMidnight == date)
}

trait ResultAgent extends AkkaSupport with HasCompetition {
  private val agent = play_akka.agent[Seq[Result]](Nil)

  def refreshResults() {
    competition.startDate.foreach { startDate =>
      agent.sendOff { old => FootballClient.results(competition.id, startDate) }
    }
  }

  def shutdownResults() { agent.close() }

  def results = agent()

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
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}

trait Competitions extends AkkaSupport {

  private var schedules: Seq[Cancellable] = Nil

  private val competitions = Seq(
    CompetitionAgent(Competition("100", "/football/premierleague", "Barclays Premier League", "Premier League")),
    CompetitionAgent(Competition("101", "/football/championsleague", "Npower Championship", "Championship")),

    CompetitionAgent(Competition("102", "/football/leagueonefootball", "Npower League One", "League One")),
    CompetitionAgent(Competition("103", "/football/leaguetwofootball", "Npower League Two", "League Two"))
  )

  def withFixturesOrResultsOn(date: DateMidnight) = competitions.map { c =>
    c.competition.copy(fixtures = c.fixturesOn(date), results = c.resultsOn(date))
  }.filter(c => c.hasResults || c.hasFixtures)

  private def refreshCompetitionData() = FootballClient.competitions.foreach { season =>
    competitions.find(_.competition.id == season.id).foreach { agent =>
      agent.update(agent.competition.copy(startDate = Some(season.startDate)))
      agent.refresh()
    }
  }

  def refresh() = competitions.foreach(_.refresh())

  def startup() {
    import play_akka.scheduler._
    schedules =
      every(Duration(5, MINUTES)) { refreshCompetitionData() } ::
        every(Duration(2, MINUTES), initialDelay = Duration(5, SECONDS)) { refresh() } ::
        Nil
  }

  def shutDown() {
    schedules.foreach(_.cancel())
    competitions.foreach(_.shutdown())
  }
}

object Competitions extends Competitions