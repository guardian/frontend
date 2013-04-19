package feed

import pa._
import model._
import conf.FootballClient
import org.joda.time.DateMidnight
import akka.util.Timeout
import common._
import model.Competition
import pa.Fixture
import org.scala_tools.time.Imports._
import play.api.libs.concurrent.Execution.Implicits._
import scala.concurrent.duration._

trait HasCompetition {
  def competition: Competition
}

trait LeagueTableAgent extends AkkaSupport with HasCompetition with Logging {

  private lazy val agent = play_akka.agent[Seq[LeagueTableEntry]](Nil)

  def refreshLeagueTable() = FootballClient.leagueTable(competition.id, new DateMidnight).map{_.map{ t =>
    val team = t.team.copy(name = TeamName(t.team))
    t.copy(team = team)
  }}.map{ table =>
    log.info(s"found ${table.size} league table entries for competition ${competition.fullName}")
    agent.send(table)
  }

  def awaitLeagueTable() { quietly { agent.await(Timeout(5000)) } }

  def shutdownLeagueTables() { agent.close() }

  def leagueTable = agent()
}

trait LiveMatchAgent extends AkkaSupport with HasCompetition with Logging {

  private lazy val agent = play_akka.agent[Seq[MatchDay]](Nil)

  def updateLiveMatches(matches: Seq[MatchDay]) = {
    val copiedMatches = matches.map { m =>
      val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }
    agent.update(copiedMatches)
  }

  def shutdownLiveMatches() { agent.close() }

  def add(theMatch: MatchDay) { agent.send(old => old :+ theMatch) }

  def liveMatches = agent()
}

trait FixtureAgent extends AkkaSupport with HasCompetition with Logging {

  private lazy val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refreshFixtures() = FootballClient.fixtures(competition.id).map{ _.map { f =>
    val homeTeam = f.homeTeam.copy(name = TeamName(f.homeTeam))
    val awayTeam = f.awayTeam.copy(name = TeamName(f.awayTeam))
    f.copy(homeTeam = homeTeam, awayTeam = awayTeam)
  }}.map{fixtures =>
    log.info(s"found ${fixtures.size} fixtures for competition ${competition.fullName}")
    agent.send(fixtures)
  }

  def add(theMatch: Fixture) { agent.send(old => old :+ theMatch) }

  def shutdownFixtures() { agent.close() }

  def awaitFixtures() { quietly(agent.await(Timeout(5000))) }

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.date.toDateMidnight == date)
}

trait ResultAgent extends AkkaSupport with HasCompetition with Logging with implicits.Collections {

  private lazy val agent = play_akka.agent[Seq[FootballMatch]](Nil)

  def refreshResults() = {

    //it is possible that we do not know the startdate of the competition yet (concurrency)
    //in that case just get the last 30 days results, the start date will catch up soon enough
    val startDate = competition.startDate.getOrElse(new DateMidnight().minusDays(30))
    val today = new DateMidnight

    FootballClient.results(competition.id, startDate).map { _.map{ r =>
        val homeTeam = r.homeTeam.copy(name = TeamName(r.homeTeam))
        val awayTeam = r.awayTeam.copy(name = TeamName(r.awayTeam))
        r.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }
    }.map{ results =>
      agent.send{ old =>
      //unfortunately we need to poll 2 feeds to get this data correctly
        val resultsToKeep = old.filter(_.date >= today).filter {
          case m: MatchDay => true
          case _ => false
        }

        log.info(s"found ${results.size} results for competition ${competition.fullName}")

        (results ++ resultsToKeep).distinctBy(_.id)
      }
    }
  }

  def addResultsFromMatchDay(matches: Seq[MatchDay]) {
    val matchesWithCorrectTeamNames = matches.map { m =>
      val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }
    agent.send { old =>
      val matchesToKeep = old.filterNot(m => matches.exists(_.id == m.id))

      (matchesToKeep ++ matchesWithCorrectTeamNames).distinctBy(_.id)
    }
  }

  def add(theMatch: Result) { agent.send(old => old :+ theMatch) }

  def shutdownResults() { agent.close() }

  def results = agent()

  def awaitResults() { quietly { agent.await(Timeout(5000)) } }

  def resultsOn(date: DateMidnight) = results.filter(_.date.toDateMidnight == date)
}

class CompetitionAgent(_competition: Competition) extends FixtureAgent with ResultAgent with LiveMatchAgent with LeagueTableAgent {

  private lazy val agent = play_akka.agent(_competition)

  def competition = agent()

  def update(competition: Competition) { agent.update(competition) }

  def refresh() {
    refreshFixtures()
    refreshResults()
    refreshLeagueTable()
  }

  def shutdown() {
    shutdownFixtures()
    shutdownResults()
    shutdownLiveMatches()
    shutdownLeagueTables()
  }

  def await() {
    awaitFixtures()
    awaitResults()
    awaitLeagueTable()
  }

  //used for adding test data
  def setMatches(matches: Seq[FootballMatch]) {
    matches.foreach {
      case fixture: Fixture => add(fixture)
      case result: Result => add(result)
      case live: MatchDay => add(live)
    }
    await()
  }

}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}