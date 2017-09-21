package rugby.feed

import common.Logging
import play.api.libs.ws.WSClient
import rugby.model._

import scala.concurrent.{ExecutionContext, Future}

sealed trait OptaEvent {
  def competition: String
  def season: String
  def hasGroupTable(stage: Stage.Value): Boolean
}

case object WorldCup2015 extends OptaEvent {
  override val competition = "210"
  override val season = "2016"
  override def hasGroupTable(stage: Stage.Value): Boolean = stage == Stage.Group
}

case class RugbyOptaFeedException(message: String) extends RuntimeException(message)

class OptaFeed(wsClient: WSClient) extends Logging {

  private def events = List(WorldCup2015)

  private val xmlContentType = ("Accept", "application/xml")

  private def getResponse(
    event: OptaEvent,
    path: String,
    feedParameter: String,
    gameParameter: Option[(String, String)] = None
  )(implicit executionContext: ExecutionContext): Future[String] = {

    val endpointOpt = conf.SportConfiguration.optaRugby.endpoint
    endpointOpt.map { endpoint =>
      val competition = "competition" -> event.competition
      val season = "season_id" -> event.season
      val apiKey = "psw" -> conf.SportConfiguration.optaRugby.apiKey.getOrElse("")
      val apiUser = "user" -> conf.SportConfiguration.optaRugby.apiUser.getOrElse("")
      val feedType = "feed_type" -> feedParameter

      val queryParams = List(competition,  season, apiKey, apiUser, feedType) ++ gameParameter

      wsClient.url(s"$endpoint$path")
        .withHttpHeaders(xmlContentType)
        .withQueryStringParameters(queryParams: _*)
        .get
        .map { response =>
        response.status match {
          case 200 => response.body
          case _ =>
            val error = s"Opta endpointOpt returned: ${response.status}, $endpoint"
            log.warn(error)
            throw RugbyOptaFeedException(error)
        }
      }
    }.getOrElse(Future.failed(RugbyOptaFeedException("No endpoint for rugby found")))
  }

  def getLiveScores()(implicit executionContext: ExecutionContext): Future[Seq[Match]] = {
    val scores = events.map { event =>
      getResponse(event, "/competition.php", "ru5").map(Parser.parseLiveScores(_, event))
    }
    Future.sequence(scores).map(_.flatten)
  }

  def getFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Seq[Match]] = {
    val fixtures = events.map { event =>
      getResponse(event, "/competition.php", "ru1").map(Parser.parseFixturesAndResults(_, event))
    }
    Future.sequence(fixtures).map(_.flatten)
  }

  def getScoreEvents(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[Seq[ScoreEvent]] = {
    getResponse(rugbyMatch.event, "/", "ru7", Some("game_id" -> rugbyMatch.id)).map { data =>
      Parser.parseLiveEventsStatsToGetScoreEvents(data)
    }
  }

  def getMatchStat(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[MatchStat] = {
    getResponse(rugbyMatch.event, "/", "ru7", Some("game_id" -> rugbyMatch.id)).map { data =>
      Parser.parseLiveEventsStatsToGetMatchStat(data)
    }
  }

  def getGroupTables()(implicit executionContext: ExecutionContext): Future[Map[OptaEvent, Seq[GroupTable]]] = {
    val tables = events.map { event =>
      getResponse(event, "/competition.php", "ru2").map(Parser.parseGroupTables)
    }
    Future.sequence(tables).map(tables => (events zip tables).toMap)
  }

}
