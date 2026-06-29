package jobs

import common.{Box, GuLogging}
import conf.cricketPa.{CompetitionMatch, CricketFeedException, CricketTeam, CricketTeams, PaFeed}
import cricketModel.Match

import java.time.{Duration, LocalDate, LocalDateTime}
import scala.concurrent.ExecutionContext

class CricketStatsJob(paFeed: PaFeed) extends GuLogging {

  private val cricketStatsAgents = CricketTeams.teams.map(Team => (Team, Box[Map[String, Match]](Map.empty)))

  def getMatch(team: CricketTeam, date: String): Option[Match] =
    cricketStatsAgents
      .find(_._1 == team)
      .flatMap { case (_, agent) => agent().get(date) }

  def findMatch(team: CricketTeam, date: String): Option[Match] = {
    val dateFormat = PaFeed.dateFormat
    val requestDate: LocalDate = LocalDate.parse(date, dateFormat)

    val matchObjects = for {
      day <- 0 until 6 // normally test matches are 5 days but we have seen at least 6 days in practice
      date <- Some(dateFormat.format(requestDate.minusDays(day)))
    } yield {
      getMatch(team, date)
    }
    matchObjects.flatten.headOption
  }

  def run(fromDate: LocalDate, matchesToFetch: Int)(implicit executionContext: ExecutionContext): Unit = {

    cricketStatsAgents.foreach { case (team, agent) =>
      // Find new ids which are not in the stats agent. Caveat: always include live matches to update.
      val loadedMatches = agent().values
        .filter(cricketMatch =>
          // Omit any recent match within the last 5 days, to account for test matches.
          Duration.between(cricketMatch.gameDate, LocalDateTime.now).toDays() > 5,
        )
        .map(m => m.matchId)
        .toSeq

      paFeed
        .getCompetitionMatches(team, fromDate)
        .map { competitionMatches: Seq[CompetitionMatch] =>
          // Filter the incoming matches against the agent loaded IDs
          // And never fetch more than 10 matches
          val filteredCompetitionMatches = competitionMatches
            .filterNot(theMatch => loadedMatches.contains(theMatch.matchId))
            .take(Math.min(matchesToFetch, 10))

          filteredCompetitionMatches.map { competitionMatch =>
            paFeed
              .getMatch(competitionMatch)
              .map { matchData =>
                val date = PaFeed.dateFormat.format(matchData.gameDate)
                log.debug(s"Updating cricket match: ${matchData.homeTeam.name} v ${matchData.awayTeam.name}, $date")
                agent.send(_ + (date -> matchData))
              }
              .recover {
                case paFeedError: CricketFeedException =>
                  log.warn(s"CricketStatsJob encountered errors: ${paFeedError.message}")
                case error: Exception => log.warn(error.getMessage)
              }
          }
        }
        .recover {
          case paFeedError: CricketFeedException =>
            log.warn(s"CricketStatsJob couldn't find matches: ${paFeedError.message}")
          case error: Exception => log.warn(error.getMessage)
        }
    }
  }
}
