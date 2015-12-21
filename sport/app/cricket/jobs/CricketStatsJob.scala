package jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import cricketPa.{CricketTeams, CricketTeam, CricketFeedException, PaFeed}
import cricketModel.Match
import org.joda.time.{Days, DateTimeZone, LocalDate}
import org.joda.time.format.DateTimeFormat

object CricketStatsJob extends ExecutionContexts with Logging {

  private val cricketStatsAgents = CricketTeams.teams.map(Team => (Team, AkkaAgent[Map[String, Match]](Map.empty)))

  private val dateFormatUTC = DateTimeFormat.forPattern("yyyy/MMM/dd").withZone(DateTimeZone.UTC)

  def getMatch(team: CricketTeam, date: String): Option[Match] = cricketStatsAgents.find(_._1 == team)
    .flatMap{ case (_, agent) => agent().get(date)}

  def run(): Unit = {

    cricketStatsAgents.foreach { case (team, agent) =>

      // Find new ids which are not in the stats agent. Caveat: always include live matches to update.
      val loadedMatches = agent().values.filter(cricketMatch =>
        // Omit any recent match within the last 5 days, to account for test matches.
        Days.daysBetween(cricketMatch.gameDate.toLocalDate, LocalDate.now).getDays > 5
      ).map(_.matchId).toSeq

      PaFeed.getMatchIds(team).map { matchIds =>

        val matches = matchIds.diff(loadedMatches).take(10)

        matches.map { matchId =>

          PaFeed.getMatch(matchId).map { matchData =>
            val date = PaFeed.dateFormat.print(matchData.gameDate)
            log.info(s"Updating cricket match: ${matchData.homeTeam.name} v ${matchData.awayTeam.name}, $date")
            agent.send(_ + (date -> matchData))
          }.recover {
            case paFeedError: CricketFeedException => log.warn(s"CricketStatsJob encountered errors: ${paFeedError.message}")
            case error: Exception => log.warn(error.getMessage)
          }
        }
      }.recover {
        case paFeedError: CricketFeedException => log.warn(s"CricketStatsJob couldn't find matches: ${paFeedError.message}")
        case error: Exception => log.warn(error.getMessage)
      }
    }
  }
}
