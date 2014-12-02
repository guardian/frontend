package jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import cricketPa.{CricketFeedException, PaFeed}
import cricketModel.Match
import org.joda.time.LocalDate

object CricketStatsJob extends ExecutionContexts with Logging {

  private val cricketStatsAgent = AkkaAgent[Map[String, Match]](Map.empty)

  def getMatch(date: String): Option[Match] = cricketStatsAgent().get(date)

  def run() {

    PaFeed.getEnglandMatchIds().map { matchIds =>
      // Find new ids which are not in the stats agent (always include today's match to update).
      val knownMatches = cricketStatsAgent().values.filterNot(_.gameDate == LocalDate.now).map(_.matchId).toSeq

      val matches = matchIds.filterNot(matchId => knownMatches.contains(matchId)).take(10)

      matches.map { matchId =>

        PaFeed.getMatch(matchId).map { matchData =>
          val date = PaFeed.dateFormat.print(matchData.gameDate)
          log.info(s"Updating cricket match: ${matchData.homeTeam.name} v ${matchData.awayTeam.name}, $date")
          cricketStatsAgent.send { _ + (date -> matchData) }
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