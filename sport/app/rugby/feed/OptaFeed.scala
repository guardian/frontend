package rugby.feed

import common.{ExecutionContexts, Logging}
import play.api.Play.current
import play.api.libs.ws.{WSRequest, WS}
import rugby.jobs.RugbyStatsJob
import rugby.model.{ScoreEvent, Match, MatchStat}

import scala.concurrent.Future
import scala.xml.XML

case class RugbyOptaFeedException(message: String) extends RuntimeException(message)

object OptaFeed extends ExecutionContexts with Logging {
  private val xmlContentType = ("Accept", "application/xml")

  private def getResponse(path: String, feedParameter: String, gameParameter: Option[(String, String)] = None): Future[String] = {

    val endpointOpt = conf.SportConfiguration.optaRugby.endpoint
    endpointOpt.map { endpoint =>
      val competition= "competition" -> "210"
      val season = "season_id" -> "2016"
      val apiKey = "psw" -> conf.SportConfiguration.optaRugby.apiKey.getOrElse("")
      val apiUser = "user" -> conf.SportConfiguration.optaRugby.apiUser.getOrElse("")
      val feedType = "feed_type" -> feedParameter

      val queryParams = List(competition,  season, apiKey, apiUser, feedType) ++ gameParameter

      WS.url(s"$endpoint$path")
        .withHeaders(xmlContentType)
        .withQueryString(queryParams: _*)
        .get
        .map { response =>
        response.status match {
          case 200 => response.body
          case _ => {
            val error = s"Opta endpointOpt returned: ${response.status}, $endpoint"
            log.warn(error)
            throw RugbyOptaFeedException(error)
          }
        }
      }
    }.getOrElse(Future.failed(RugbyOptaFeedException("No endpoint for rugby found")))
  }

  def getLiveScores: Future[Seq[Match]] = getResponse("/competition.php", "ru5").map(Parser.parseLiveScores)

  def getFixturesAndResults: Future[Seq[Match]] = getResponse("/competition.php", "ru1").map(Parser.parseFixturesAndResults)

  def getScoreEvents(matchId: String): Future[Seq[ScoreEvent]] = {
    getResponse("/", "ru7", Some("game_id" -> matchId)).map { data =>
      Parser.parseLiveEventsStatsToGetScoreEvents(data)
    }
  }

  def getMatchStat(matchId: String): Future[MatchStat] = {
    getResponse("/", "ru7", Some("game_id" -> matchId)).map { data =>
      Parser.parseLiveEventsStatsToGetMatchStat(data)
    }
  }

}
