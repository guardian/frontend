package feed

import pa._
import conf.FootballClient
import common._
import model.{Competition, TeamNameBuilder}
import java.time.LocalDate

import scala.concurrent.{ExecutionContext, Future}
import java.time.Clock

trait Lineups extends GuLogging {
  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder
  def getLineup(theMatch: FootballMatch)(implicit executionContext: ExecutionContext): Future[LineUp] =
    footballClient
      .lineUp(theMatch.id)
      .map { m =>
        val homeTeam = m.homeTeam.copy(name = teamNameBuilder.withTeam(m.homeTeam))
        val awayTeam = m.awayTeam.copy(name = teamNameBuilder.withTeam(m.awayTeam))
        LineUp(homeTeam, awayTeam, m.homeTeamPossession)
      }
      .recover(footballClient.logErrorsWithMessage(s"Failed getting line-up for match ${theMatch.id}"))
}

trait LiveMatches extends GuLogging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getLiveMatches(clock: Clock)(implicit executionContext: ExecutionContext): Future[Map[String, Seq[MatchDay]]] =
    footballClient
      .matchDay(LocalDate.now(clock))
      .map { todaysMatches: List[MatchDay] =>
        val matchesWithCompetitions = todaysMatches.filter(_.competition.isDefined)

        val matchesWithCleanedTeams = matchesWithCompetitions.map { m =>
          val homeTeam = m.homeTeam.copy(name = teamNameBuilder.withTeam(m.homeTeam))
          val awayTeam = m.awayTeam.copy(name = teamNameBuilder.withTeam(m.awayTeam))
          m.copy(homeTeam = homeTeam, awayTeam = awayTeam)
        }

        // we have checked above that the competition does exist for these matches
        matchesWithCleanedTeams.groupBy(_.competition.head.id)
      }
      .recover(footballClient.logErrorsWithMessage(s"Failed getting live matches"))
}

trait LeagueTables extends GuLogging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getLeagueTable(
      competition: Competition,
      clock: Clock,
  )(implicit executionContext: ExecutionContext): Future[List[LeagueTableEntry]] = {
    log.info(s"refreshing table for ${competition.id}")
    footballClient
      .leagueTable(competition.id, LocalDate.now(clock))
      .map {
        _.map { t =>
          val team = t.team.copy(name = teamNameBuilder.withTeam(t.team))
          t.copy(team = team)
        }
      }
      .recover(footballClient.logErrorsWithMessage(s"Failed getting league table for competition: ${competition.id}"))
  }
}

trait Fixtures extends GuLogging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getFixtures(competition: Competition)(implicit executionContext: ExecutionContext): Future[List[Fixture]] = {
    log.info(s"refreshing fixtures for ${competition.id}")
    footballClient
      .fixtures(competition.id)
      .map {
        _.map { f =>
          val homeTeam = f.homeTeam.copy(name = teamNameBuilder.withTeam(f.homeTeam))
          val awayTeam = f.awayTeam.copy(name = teamNameBuilder.withTeam(f.awayTeam))
          f.copy(homeTeam = homeTeam, awayTeam = awayTeam)
        }
      }
      .recover(footballClient.logErrorsWithMessage(s"Failed getting fixtures for competition: ${competition.id}"))
  }
}

trait Results extends GuLogging {

  def footballClient: FootballClient
  def teamNameBuilder: TeamNameBuilder

  def getResults(competition: Competition, clock: Clock)(implicit
      executionContext: ExecutionContext,
  ): Future[List[Result]] = {
    log.info(s"refreshing results for ${competition.id} with startDate: ${competition.startDate}")
    //it is possible that we do not know the startdate of the competition yet (concurrency)
    //in that case just get the last 30 days results, the start date will catch up soon enough
    val startDate = competition.startDate.getOrElse(LocalDate.now(clock).minusDays(30))
    footballClient
      .results(competition.id, startDate)
      .map {
        _.map { r =>
          val homeTeam = r.homeTeam.copy(name = teamNameBuilder.withTeam(r.homeTeam))
          val awayTeam = r.awayTeam.copy(name = teamNameBuilder.withTeam(r.awayTeam))
          r.copy(homeTeam = homeTeam, awayTeam = awayTeam)
        }
      } // TODO it would be nice to handle expected errors more gracefully (e.g. like 'No data available', which happens in between seasons)
      .recover(footballClient.logErrorsWithMessage(s"Failed getting results for competition: ${competition.id}"))
  }
}

class CompetitionAgent(
    val footballClient: FootballClient,
    val teamNameBuilder: TeamNameBuilder,
    _competition: Competition,
) extends Fixtures
    with Results
    with LeagueTables
    with implicits.Football {

  private lazy val agent = Box(_competition)

  def competition: Competition = agent()

  def update(competition: Competition): Unit = agent.send(competition)

  def refreshFixtures()(implicit executionContext: ExecutionContext): Unit = getFixtures(competition) foreach addMatches

  def refreshResults(clock: Clock)(implicit executionContext: ExecutionContext): Unit =
    getResults(competition, clock) foreach addMatches

  def refreshLeagueTable(clock: Clock)(implicit executionContext: ExecutionContext): Unit =
    getLeagueTable(competition, clock) foreach { entries =>
      agent.send { _.copy(leagueTable = entries) }
    }

  object MatchStatusOrdering extends Ordering[FootballMatch] {
    private def statusValue(m: FootballMatch) = if (m.isResult) 1 else if (m.isLive) 2 else 3
    def compare(a: FootballMatch, b: FootballMatch): Int = statusValue(a) - statusValue(b)
  }

  def addMatches(newMatches: Seq[FootballMatch]): Future[Competition] =
    agent.alter { comp =>
      //log any changes to the status of the match
      newMatches.foreach { newMatch =>
        comp.matches.find(_.id == newMatch.id).foreach { oldMatch =>
          val newSummary = newMatch.statusSummary
          val oldSummary = oldMatch.statusSummary
          if (newSummary != oldSummary) log.info(s"Match Status Changed $oldSummary -> $newSummary")
        }
      }

      val allMatches = (newMatches ++ comp.matches).sorted(MatchStatusOrdering).distinctBy(_.id).sortByDate

      val updatedMatches = allMatches.filter(footballMatch =>
        (!isPlaceholderMatch(footballMatch)) ||
          (isPlaceholderMatch(footballMatch) && !nonPlaceHolderMatchWithSameDateExists(allMatches, footballMatch)),
      )

      comp.copy(matches = updatedMatches)
    }

  def isPlaceholderMatch(footballMatch: FootballMatch): Boolean = {
    val placeholderIndicator = Set("Winner", "Runner-up", "Wnr Gp", "R-Up Gp", "Loser")
    placeholderIndicator.exists(indicator => footballMatch.homeTeam.name.contains(indicator))
  }

  def nonPlaceHolderMatchWithSameDateExists(
      allMatches: Seq[FootballMatch],
      placeHolderMatch: FootballMatch,
  ): Boolean = {
    allMatches.exists(footballMatch =>
      footballMatch.date == placeHolderMatch.date && !isPlaceholderMatch(footballMatch),
    )
  }

  def refresh(clock: Clock)(implicit executionContext: ExecutionContext): Unit = {
    refreshFixtures()
    refreshResults(clock)
    refreshLeagueTable(clock)
  }
}
