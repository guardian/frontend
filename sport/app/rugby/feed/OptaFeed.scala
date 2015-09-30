package rugby.feed

import common.{ExecutionContexts, Logging}
import play.api.Play.current
import play.api.libs.ws.{WSRequest, WS}
import rugby.jobs.RugbyStatsJob
import rugby.model._
import conf.Configuration

import scala.concurrent.Future
import scala.xml.XML

sealed trait OptaEvent {
  def competition: String
  def season: String
  def hasGroupTable(stage: Stage.Value): Boolean
}

case object WarmupWorldCup2015 extends OptaEvent {
  override val competition = "3"
  override val season = "2016"
  override def hasGroupTable(stage: Stage.Value) = false
}

case object WorldCup2015 extends OptaEvent {
  override val competition = "210"
  override val season = "2016"
  override def hasGroupTable(stage: Stage.Value) = stage == Stage.Group
}

case class RugbyOptaFeedException(message: String) extends RuntimeException(message)

object OptaFeed extends ExecutionContexts with Logging {

  private def events =
    if(Configuration.environment.isNonProd && conf.switches.Switches.RugbyWorldCupFriendlies.isSwitchedOn) List(WarmupWorldCup2015, WorldCup2015)
    else List(WorldCup2015)


  private val xmlContentType = ("Accept", "application/xml")

  private def getResponse(event: OptaEvent, path: String, feedParameter: String, gameParameter: Option[(String, String)] = None): Future[String] = {

    val endpointOpt = conf.SportConfiguration.optaRugby.endpoint
    endpointOpt.map { endpoint =>
      val competition = "competition" -> event.competition
      val season = "season_id" -> event.season
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

  def getLiveScores: Future[Seq[Match]] = {
    val scores = events.map { event =>
      getResponse(event, "/competition.php", "ru5").map(Parser.parseLiveScores(_, event))
    }
    Future.sequence(scores).map(_.flatten)
  }

  def getFixturesAndResults: Future[Seq[Match]] = {
    val fixtures = events.map { event =>
      getResponse(event, "/competition.php", "ru1").map(Parser.parseFixturesAndResults(_, event))
    }
    Future.sequence(fixtures).map(_.flatten)
  }

  def getScoreEvents(rugbyMatch: Match): Future[Seq[ScoreEvent]] = {
    getResponse(rugbyMatch.event, "/", "ru7", Some("game_id" -> rugbyMatch.id)).map { data =>
      Parser.parseLiveEventsStatsToGetScoreEvents(data)
    }
  }

  def getMatchStat(rugbyMatch: Match): Future[MatchStat] = {
    getResponse(rugbyMatch.event, "/", "ru7", Some("game_id" -> rugbyMatch.id)).map { data =>
      Parser.parseLiveEventsStatsToGetMatchStat(data)
    }
  }

  def getGroupTables: Future[Map[OptaEvent, Seq[GroupTable]]] = {
    val tables = events.map { event =>
      getResponse(event, "/competition.php", "ru2").map(Parser.parseGroupTables)
    }
    Future.sequence(tables).map(tables => (events zip tables).toMap)
  }

}
