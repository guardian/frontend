package feed

import pa._
import conf.FootballClient
import org.joda.time.LocalDate
import common._
import model.{Competition, TeamNameBuilder}

import scala.concurrent.Future


trait Lineups extends ExecutionContexts with Logging {
  def footballClient: FootballClient
  def competitions: Competitions
  def teamNameBuilder = new TeamNameBuilder(competitions)
  def getLineup(theMatch: FootballMatch): Future[LineUp] = footballClient.lineUp(theMatch.id).map{ m =>
    val homeTeam = m.homeTeam.copy(name = teamNameBuilder.withTeam(m.homeTeam))
    val awayTeam = m.awayTeam.copy(name = teamNameBuilder.withTeam(m.awayTeam))
    LineUp(homeTeam, awayTeam, m.homeTeamPossession)
  }
    .recover(footballClient.logErrors)
}

trait LiveMatches extends ExecutionContexts with Logging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getLiveMatches: Future[Map[String, Seq[MatchDay]]] = footballClient.matchDay(LocalDate.now).map{ todaysMatches: List[MatchDay] =>

    val matchesWithCompetitions = todaysMatches.filter(_.competition.isDefined)

    val matchesWithCleanedTeams = matchesWithCompetitions.map{ m =>
      val homeTeam = m.homeTeam.copy(name = teamNameBuilder.withTeam(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = teamNameBuilder.withTeam(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }

    // we have checked above that the competition does exist for these matches
    matchesWithCleanedTeams.groupBy(_.competition.head.id)
  }
    .recover(footballClient.logErrors)
}

trait LeagueTables extends ExecutionContexts with Logging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getLeagueTable(competition: Competition): Future[List[LeagueTableEntry]] = {
    log.info(s"refreshing table for ${competition.id}")
    footballClient.leagueTable(competition.id, new LocalDate).map {
      _.map { t =>
        val team = t.team.copy(name = teamNameBuilder.withTeam(t.team))
        t.copy(team = team)
      }
    }
      .recover(footballClient.logErrors)
  }
}

trait Fixtures extends ExecutionContexts with Logging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getFixtures(competition: Competition): Future[List[Fixture]] = {
    log.info(s"refreshing fixtures for ${competition.id}")
    footballClient.fixtures(competition.id).map {
      _.map { f =>
        val homeTeam = f.homeTeam.copy(name = teamNameBuilder.withTeam(f.homeTeam))
        val awayTeam = f.awayTeam.copy(name = teamNameBuilder.withTeam(f.awayTeam))
        f.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }
    }
      .recover(footballClient.logErrors)
  }
}

trait Results extends ExecutionContexts with Logging with implicits.Collections {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getResults(competition: Competition): Future[List[Result]] = {
    log.info(s"refreshing results for ${competition.id} with startDate: ${competition.startDate}")
    //it is possible that we do not know the startdate of the competition yet (concurrency)
    //in that case just get the last 30 days results, the start date will catch up soon enough
    val startDate = competition.startDate.getOrElse(new LocalDate().minusDays(30))
    footballClient.results(competition.id, startDate).map { _.map{ r =>
        val homeTeam = r.homeTeam.copy(name = teamNameBuilder.withTeam(r.homeTeam))
        val awayTeam = r.awayTeam.copy(name = teamNameBuilder.withTeam(r.awayTeam))
        r.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }
    }
      .recover(footballClient.logErrors)
  }
}

class CompetitionAgent(val footballClient: FootballClient, val teamNameBuilder: TeamNameBuilder, _competition: Competition) extends Fixtures with Results with LeagueTables with implicits.Football {

  private lazy val agent = AkkaAgent(_competition)

  def competition: Competition = agent()

  def update(competition: Competition): Unit = agent.send(competition)

  def refreshFixtures(): Unit = getFixtures(competition) foreach addMatches

  def refreshResults(): Unit = getResults(competition) foreach addMatches

  def refreshLeagueTable(): Unit = getLeagueTable(competition) foreach { entries =>
    agent.send{ _.copy(leagueTable = entries) }
  }

  object MatchStatusOrdering extends Ordering[FootballMatch] {
    private def statusValue(m: FootballMatch) = if (m.isResult) 1 else if (m.isLive) 2 else 3
    def compare(a: FootballMatch, b: FootballMatch): Int = statusValue(a) - statusValue(b)
  }

  def addMatches(newMatches: Seq[FootballMatch]): Future[Competition] = agent.alter{ comp =>

    //log any changes to the status of the match
    newMatches.foreach{ newMatch =>
      comp.matches.find(_.id == newMatch.id).foreach{ oldMatch =>
        val newSummary = newMatch.statusSummary
        val oldSummary = oldMatch.statusSummary
        if (newSummary != oldSummary) log.info(s"Match Status Changed $oldSummary -> $newSummary")
      }
    }

                         //it is important that newMatches are at the start of the list here
    comp.copy(matches = (newMatches ++ comp.matches).sorted(MatchStatusOrdering).distinctBy(_.id).sortByDate)
  }

  def refresh() {
    refreshFixtures()
    refreshResults()
    refreshLeagueTable()
  }
}
