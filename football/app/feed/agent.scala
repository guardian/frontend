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

trait HasCompetition {
  def competition: Competition
}

trait LeagueTableAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[LeagueTableEntry]](Nil)

  def refreshLeagueTable() {
    agent.sendOff { old =>
      val table = FootballClient.leagueTable(competition.id, new DateMidnight)
      log.info("found %s league table entries for competition %s".format(table.size, competition.fullName))
      table.map { t =>
        val team = t.team.copy(name = TeamName(t.team))
        t.copy(team = team)
      }
    }
  }

  def awaitLeagueTable() { quietly { agent.await(Timeout(5000)) } }

  def shutdownLeagueTables() { agent.close() }

  def leagueTable = agent()
}

trait LiveMatchAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[MatchDay]](Nil)

  def updateLiveMatches(matches: Seq[MatchDay]) = {
    val copiedMatches = matches.map { m =>
      val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }
    agent.update(copiedMatches)
  }

  def shutdownLiveMatches() { agent.close() }

  def liveMatches = agent()
}

trait FixtureAgent extends AkkaSupport with HasCompetition with Logging {

  private val agent = play_akka.agent[Seq[Fixture]](Nil)

  def refreshFixtures() {
    agent.sendOff { old =>
      val fixtures = FootballClient.fixtures(competition.id)
      log.info("found %s fixtures for competition %s".format(fixtures.size, competition.fullName))
      fixtures.map { f =>
        val homeTeam = f.homeTeam.copy(name = TeamName(f.homeTeam))
        val awayTeam = f.awayTeam.copy(name = TeamName(f.awayTeam))
        f.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }
    }
  }

  def shutdownFixtures() { agent.close() }

  def awaitFixtures() { quietly(agent.await(Timeout(5000))) }

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.date.toDateMidnight == date)
}

trait ResultAgent extends AkkaSupport with HasCompetition with Logging with implicits.Collections {

  private val agent = play_akka.agent[Seq[FootballMatch]](Nil)

  def refreshResults() {

    //it is possible that we do not know the startdate of the competition yet (concurrency)
    //in that case just get the last 30 days results, the start date will catch up soon enough
    val startDate = competition.startDate.getOrElse(new DateMidnight().minusDays(30))

    agent.sendOff { old =>

      val today = new DateMidnight

      //unfortunately we need to poll 2 feeds to get this data correctly
      val resultsToKeep = old.filter(_.date >= today).filter {
        case m: MatchDay => true
        case _ => false
      }

      val results = FootballClient.results(competition.id, startDate).map { r =>
        val homeTeam = r.homeTeam.copy(name = TeamName(r.homeTeam))
        val awayTeam = r.awayTeam.copy(name = TeamName(r.awayTeam))
        r.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }
      log.info("found %s results for competition %s".format(results.size, competition.fullName))

      (results ++ resultsToKeep).distinctBy(_.id)
    }
  }

  def addResultsFromMatchDay(matches: Seq[MatchDay]) {
    agent.send { old =>
      val matchesToKeep = old.filterNot(m => matches.exists(_.id == m.id))
      val copiedMatches = matches.map { m =>
        val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
        val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
        m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }

      (matchesToKeep ++ copiedMatches).distinctBy(_.id)
    }
  }

  def shutdownResults() { agent.close() }

  def results = agent()

  def awaitResults() { quietly { agent.await(Timeout(5000)) } }

  def resultsOn(date: DateMidnight) = results.filter(_.date.toDateMidnight == date)
}

class CompetitionAgent(_competition: Competition) extends FixtureAgent with ResultAgent with LiveMatchAgent with LeagueTableAgent {

  private val agent = play_akka.agent(_competition)

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
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}