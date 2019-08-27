package rugby.feed

import common.Logging
import play.api.libs.ws.WSClient
import rugby.model._

import scala.concurrent.{ExecutionContext, Future}

trait RugbyFeed {
  def getLiveScores()(implicit executionContext: ExecutionContext): Future[Seq[Match]]
  def getFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Seq[Match]]
  def getScoreEvents(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[Seq[ScoreEvent]]
  def getMatchStat(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[MatchStat]
  def getGroupTables()(implicit executionContext: ExecutionContext): Future[Map[OptaEvent, Seq[GroupTable]]]
}

trait RugbyClient {
  // Each tournament is associated with one or more 'seasons'
  // (e.g. World Cup has seasons for 2019, 2015, etc.).
  // 'Events' are matches.
  def getEvents(seasonID: Int)(implicit executionContext: ExecutionContext): Future[PAMatchesResponse]

  // Standings are league or group tables. A standing ID is
  // a unique ID identifying a table-type and tournament
  // season.
  def getStanding(standingID: Int)(implicit executionContext: ExecutionContext): Future[PATableResponse]

  // Actions are things like tries.
  def getEventActions(eventID: Int)(implicit executionContext: ExecutionContext): Future[Seq[PAEvent]]
}

case class JsonParseException(msg: String) extends RuntimeException(msg)
case class PARugbyAPIException(msg: String) extends RuntimeException(msg)

object WorldCupPAIDs {
  val rugbyID = 29
  val worldCupTournamentID = 482 // ...which has 'seasons' for each competition year...
  val worldCup2019SeasonID = 11421

  // http://sport.api.press.net/v1/stage?season=11421, then e.g.
  // http://sport.api.press.net/v1/standing?stage=849625 for each.
  val worldCup2019GroupIDs = List(235175, 235176, 235178, 235180)
}

class PARugbyFeed(rugbyClient: RugbyClient) extends RugbyFeed with Logging {

  import WorldCupPAIDs._

  def getLiveScores()(implicit executionContext: ExecutionContext): Future[Seq[Match]] = {
    val x = getFixturesAndResults().map(_.filter(_.isLive))
    x.onComplete(foo => log.info("RUGBY " + foo.toString))
    x
  }

  def getFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Seq[Match]] = {
    rugbyClient.getEvents(worldCup2019SeasonID)
      .map(games => games.items.map(PAMatch.toMatch))
  }

  def getScoreEvents(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[Seq[ScoreEvent]] = {
    def eventsForGame(gameID: Int): Future[Seq[ScoreEvent]] = {
      rugbyClient.getEventActions(gameID).map(_.flatMap(PAEvent.toScoreEvent))
    }

    eventsForGame(rugbyMatch.id.toInt)
  }

  def getMatchStat(rugbyMatch: Match)(implicit executionContext: ExecutionContext): Future[MatchStat] = {
    // WARNING PA -> Opta translation (MatchStat type) likely to be very difficult
    // Perhaps we should see if we can avoid this endpoint?
    ???
  }

  def getGroupTables()(implicit executionContext: ExecutionContext): Future[Map[OptaEvent, Seq[GroupTable]]] = {
    val tables = worldCup2019GroupIDs.map(id => rugbyClient.getStanding(id))

    for {
      tables <- Future.sequence(tables)
    } yield Map[OptaEvent, Seq[GroupTable]](WorldCup2019 -> tables.map(table => PATableResponse.toGroupTable(table)))
  }
}

class PARugbyClient(wsClient: WSClient) extends RugbyClient {

  val apiKey = conf.SportConfiguration.pa.rugbyKey.getOrElse("")
  val basePath = "https://sport.api.press.net/v1"

  override def getEvents(seasonID: Int)
    (implicit executionContext: ExecutionContext): Future[PAMatchesResponse] = {

    val resp = request(wsClient, s"/event?season=$seasonID", Map.empty)
    resp.map(json => PAMatchesResponse.fromJSON(json).get) // TODO fix .gets
  }

  override def getStanding(standingID: Int)
    (implicit executionContext: ExecutionContext): Future[PATableResponse] = {

    val resp = request(wsClient, s"/standing/$standingID", Map.empty)
    resp.map(json => PATableResponse.fromJSON(json).get)
  }

  override def getEventActions(eventID: Int)
    (implicit executionContext: ExecutionContext): Future[Seq[PAEvent]] = {

    val resp = request(wsClient, s"/event/$eventID/actions", Map.empty)
    resp.map(json => {
      PAEvent
        .fromJSONList(json)
        .getOrElse(Nil)
    })
  }

  def request(
    client: WSClient,
    path: String,
    params: Map[String, String]
  )(implicit executionContext: ExecutionContext): Future[String] = {
    val headers = Map("apikey" -> apiKey, "Accept" -> "application/json")

    client.url(basePath + path)
      .addHttpHeaders(headers.toSeq: _*)
      .addQueryStringParameters(params.toSeq: _*)
      .get()
      .map(resp => {
        resp.status match {
          case 200 => resp.body
          case _ => throw PARugbyAPIException(s"request for $path failed (status: ${resp.status}, body: ${resp.body})")
        }
      })
  }

  def requestMatches(
    client: WSClient,
    path: String,
    params: Map[String, String]
  )(implicit executionContext: ExecutionContext): Future[List[PAMatch]] = {

    def cycle(
      fn: Int => Future[PAMatchesResponse],
      acc: Future[List[PAMatch]],
      page: Int
    )(implicit executionContext: ExecutionContext): Future[List[PAMatch]] = {

      val response = fn(page)

      response.flatMap(resp => {
        if (resp.hasNext) {
          val newAcc = acc.map(_ ++ resp.items)
          cycle(fn, newAcc, page + 1)
        } else {
          acc
        }
      })
    }

    val getPage: Int => Future[PAMatchesResponse] = (page: Int) => {
      val qps = params + ("page" -> page.toString)

      request(client, path, qps)
        .map(json => PAMatchesResponse.fromJSON(json).get)
    }

    cycle(getPage, Future.successful(Nil), 1)
  }
}
