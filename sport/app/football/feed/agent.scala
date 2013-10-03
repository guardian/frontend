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

trait LeagueTableAgent extends HasCompetition with ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Seq[LeagueTableEntry]](Nil)

  def refreshLeagueTable() = FootballClient.leagueTable(competition.id, new DateMidnight).map{_.map{ t =>
    val team = t.team.copy(name = TeamName(t.team))
    t.copy(team = team)
  }}.flatMap{ table =>
    log.info(s"found ${table.size} league table entries for competition ${competition.fullName}")
    agent.alter(t => table)(Timeout(2000))
  }

  def updateLeagueTable(leagueTable: Seq[LeagueTableEntry]) = agent.alter(l => leagueTable)(Timeout(2000))

  def shutdownLeagueTables() { agent.close() }

  def leagueTable = agent()
}

trait LiveMatchAgent extends HasCompetition with Logging {

  private lazy val agent = AkkaAgent[Seq[MatchDay]](Nil)

  def updateLiveMatches(matches: Seq[MatchDay]) = {
    val copiedMatches = matches.map { m =>
      val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }
    agent.alter(m => copiedMatches)(Timeout(2000))
  }

  def shutdownLiveMatches() { agent.close() }

  def add(theMatch: MatchDay) = agent.alter(old => old :+ theMatch)(Timeout(2000))

  def liveMatches = agent()
}

trait FixtureAgent extends HasCompetition with ExecutionContexts with Logging {

  private lazy val agent = AkkaAgent[Seq[Fixture]](Nil)

  def refreshFixtures() = FootballClient.fixtures(competition.id).map{ _.map { f =>
    val homeTeam = f.homeTeam.copy(name = TeamName(f.homeTeam))
    val awayTeam = f.awayTeam.copy(name = TeamName(f.awayTeam))
    f.copy(homeTeam = homeTeam, awayTeam = awayTeam)
  }}.flatMap{fixtures =>
    log.info(s"found ${fixtures.size} fixtures for competition ${competition.fullName}")
    agent.alter(f => fixtures)(Timeout(2000))
  }

  def add(theMatch: Fixture) = agent.alter(old => old :+ theMatch)(Timeout(2000))

  def shutdownFixtures() { agent.close() }

  def updateFixtures(fixtures: Seq[Fixture]) = agent.alter(old => fixtures)(Timeout(2000))

  def fixtures = agent()

  def fixturesOn(date: DateMidnight) = fixtures.filter(_.date.toDateMidnight == date)
}

trait ResultAgent extends HasCompetition with ExecutionContexts with Logging with implicits.Collections {

  private lazy val agent = AkkaAgent[Seq[FootballMatch]](Nil)

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
    }.flatMap{ results =>
      agent.alter{ old =>
      //unfortunately we need to poll 2 feeds to get this data correctly
        val resultsToKeep = old.filter(_.date >= today).filter {
          case m: MatchDay => true
          case _ => false
        }

        log.info(s"found ${results.size} results for competition ${competition.fullName}")

        (results ++ resultsToKeep).distinctBy(_.id)
      }(Timeout(2000))
    }
  }

  def addResultsFromMatchDay(matches: Seq[MatchDay]) = {
    val matchesWithCorrectTeamNames = matches.map { m =>
      val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }
    agent.alter { old =>
      val matchesToKeep = old.filterNot(m => matches.exists(_.id == m.id))

      (matchesToKeep ++ matchesWithCorrectTeamNames).distinctBy(_.id)
    }(Timeout(2000))
  }

  def add(theMatch: Result) = agent.alter(old => old :+ theMatch)(Timeout(2000))

  def shutdownResults() { agent.close() }

  def results = agent()

  def updateResults(results: Seq[FootballMatch]) = agent.alter(r => results)(Timeout(2000))

  def resultsOn(date: DateMidnight) = results.filter(_.date.toDateMidnight == date)
}

class CompetitionAgent(_competition: Competition) extends FixtureAgent with ResultAgent with LiveMatchAgent with LeagueTableAgent {

  private lazy val agent = AkkaAgent(_competition)

  def competition = agent()

  def update(competition: Competition) = agent.alter(c => competition)(Timeout(2000))

  def refresh() {
    refreshFixtures()
    refreshResults()
    refreshLeagueTable()
  }

  def stop() {
    shutdownFixtures()
    shutdownResults()
    shutdownLiveMatches()
    shutdownLeagueTables()
    agent.close()
  }
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}