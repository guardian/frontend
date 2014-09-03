package jobs

import common.{AkkaAgent, ExecutionContexts, Logging}
import cricketPa.{CricketFeedException, PaFeed}
import cricketModel.Match

import scala.concurrent.Future

object CricketStatsJob extends ExecutionContexts with Logging {

  private val cricketStatsAgent = AkkaAgent[Map[String, Match]](Map.empty)

  def getMatch(date: String): Option[Match] = cricketStatsAgent().get(date)

  def run() {

    val getMatchData: Future[Seq[Match]] = PaFeed.getEnglandMatchIds().flatMap { matchIds =>
      Future.sequence(matchIds.map(PaFeed.getMatch)) }

    getMatchData.foreach { matches =>
      matches.foreach { matchData: Match =>
        val date = PaFeed.dateFormat.print(matchData.gameDate)
        log.info(s"Updating cricket match: ${matchData.homeTeam.name} v ${matchData.awayTeam.name}, $date}")
        cricketStatsAgent.send { _ + (date -> matchData) }
      }
    }
    getMatchData.recover {
      case paFeedError: CricketFeedException => log.warn(s"Get Match Ids failed :\n ${paFeedError.message}")
      case error: Throwable => log.warn(error.getMessage)
    }
  }
}