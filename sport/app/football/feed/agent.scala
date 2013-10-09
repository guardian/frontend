package feed

import pa._
import model._
import conf.FootballClient
import org.joda.time.DateMidnight
import common._
import model.Competition
import scala.concurrent.Future


trait Lineups extends ExecutionContexts with Logging {
  def getLineup(theMatch: FootballMatch) = FootballClient.lineUp(theMatch.id).map{ m =>
    val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
    val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
    LineUp(homeTeam, awayTeam, m.homeTeamPossession)
  }
}

trait LiveMatches extends ExecutionContexts with Logging {
  def getLiveMatches: Future[Map[String, Seq[MatchDay]]] = FootballClient.matchDay(DateMidnight.now).map{ todaysMatches: List[MatchDay] =>

    val matchesWithCompetitions = todaysMatches.filter(_.competition.isDefined)

    val matchesWithCleanedTeams = matchesWithCompetitions.map{ m =>
      val homeTeam = m.homeTeam.copy(name = TeamName(m.homeTeam))
      val awayTeam = m.awayTeam.copy(name = TeamName(m.awayTeam))
      m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
    }

    // we have checked above that the competition does exist for these matches
    matchesWithCleanedTeams.groupBy(_.competition.head.id)
  }
}

trait LeagueTables extends ExecutionContexts with Logging {
  def getLeagueTable(competition: Competition) = FootballClient.leagueTable(competition.id, new DateMidnight).map{_.map{ t =>
    val team = t.team.copy(name = TeamName(t.team))
    t.copy(team = team)
  }}
}


trait Fixtures extends ExecutionContexts with Logging {
  def getFixtures(competition: Competition) = FootballClient.fixtures(competition.id).map{ _.map { f =>
    val homeTeam = f.homeTeam.copy(name = TeamName(f.homeTeam))
    val awayTeam = f.awayTeam.copy(name = TeamName(f.awayTeam))
    f.copy(homeTeam = homeTeam, awayTeam = awayTeam)
  }}
}

trait Results extends ExecutionContexts with Logging with implicits.Collections {
  def getResults(competition: Competition) = {
    //it is possible that we do not know the startdate of the competition yet (concurrency)
    //in that case just get the last 30 days results, the start date will catch up soon enough
    val startDate = competition.startDate.getOrElse(new DateMidnight().minusDays(30))
    FootballClient.results(competition.id, startDate).map { _.map{ r =>
        val homeTeam = r.homeTeam.copy(name = TeamName(r.homeTeam))
        val awayTeam = r.awayTeam.copy(name = TeamName(r.awayTeam))
        r.copy(homeTeam = homeTeam, awayTeam = awayTeam)
      }
    }
  }
}

class CompetitionAgent(_competition: Competition) extends Fixtures with Results with LeagueTables with implicits.Football {

  private lazy val agent = AkkaAgent(_competition)

  def competition = agent()

  def update(competition: Competition) = agent.send(competition)

  def refreshFixtures() = getFixtures(competition) foreach addMatches

  def refreshResults() = getResults(competition) foreach addMatches

  def refreshLeagueTable() = getLeagueTable(competition) foreach { entries =>
    agent.send{ _.copy(leagueTable = entries) }
  }

  object MatchStatusOrdering extends Ordering[FootballMatch] {
      private def statusValue(m: FootballMatch) = if (m.isResult) 1 else if (m.isLive) 2 else 3
      def compare(a: FootballMatch, b: FootballMatch) = statusValue(a) - statusValue(b)
    }

  def addMatches(newMatches: Seq[FootballMatch]) = agent.send{ comp =>

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

  def stop() {
    agent.close()
  }
}

object CompetitionAgent {
  def apply(competition: Competition) = new CompetitionAgent(competition)
}