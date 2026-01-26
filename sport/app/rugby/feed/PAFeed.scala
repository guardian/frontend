package rugby.feed

import common.GuLogging
import play.api.libs.json.{JsBoolean, Json}
import play.api.libs.ws.WSClient
import rugby.model._

import scala.concurrent.{ExecutionContext, Future}

// PA info:
// https://sport.pressassociation.io/reference (API explorer and reference)
// https://sport.pressassociation.io/docs (some additional documentation)

trait RugbyFeed {
  def getLiveScores()(implicit executionContext: ExecutionContext): Future[Seq[Match]]
  def getFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Seq[Match]]
}

trait RugbyClient {
  // Each tournament is associated with one or more 'seasons'
  // (e.g. World Cup has seasons for 2019, 2015, etc.).
  // 'Events' are matches.
  def getEvents(seasonID: Int)(implicit executionContext: ExecutionContext): Future[List[PAMatch]]
}

case class JsonParseException(msg: String) extends RuntimeException(msg)
case class PARugbyAPIException(msg: String) extends RuntimeException(msg)

sealed trait Event {
  def competition: String
  def season: String
  def hasGroupTable(stage: Stage.Value): Boolean
}

case object WorldCup2019 extends Event {
  override val competition = "482"
  override val season = "2019"
  override def hasGroupTable(stage: Stage.Value): Boolean = stage == Stage.Group
}

object WorldCupPAIDs {
  val rugbyID = 29
  val worldCupTournamentID = 482 // ...which has 'seasons' for each competition year...

  val worldCup2019SeasonID = 11421
  val worldCup2015SeasonID = 8131
  val worldCupSeasonID = worldCup2019SeasonID

  // http://sport.api.press.net/v1/stage?season=11421, then e.g.
  // http://sport.api.press.net/v1/standing?stage=849625 for each.
  val worldCup2019GroupIDs = List(235175, 235176, 235178, 235180)
  val worldCup2015GroupIDs = List(151079, 151081, 151083, 151085)
  val worldCupGroupIDs = worldCup2019GroupIDs
}

class PARugbyFeed(rugbyClient: RugbyClient) extends RugbyFeed with GuLogging {

  import WorldCupPAIDs._

  override def getLiveScores()(implicit executionContext: ExecutionContext): Future[Seq[Match]] = {
    getFixturesAndResults().map(_.filter(_.isLive))
  }

  override def getFixturesAndResults()(implicit executionContext: ExecutionContext): Future[Seq[Match]] = {
    rugbyClient.getEvents(worldCupSeasonID).map(_.map(PAMatch.toMatch))
  }
}

class PARugbyClient(wsClient: WSClient) extends RugbyClient with GuLogging {

  val apiKey = conf.SportConfiguration.pa.rugbyKey.getOrElse("")
  val basePath = conf.SportConfiguration.pa.rugbyEndpoint.getOrElse("")

  override def getEvents(seasonID: Int)(implicit executionContext: ExecutionContext): Future[List[PAMatch]] = {

    val resp = request(wsClient, s"/event?season=$seasonID", Map.empty)
    val matches = resp.map(jsons => jsons.map(json => PAMatchesResponse.fromJSON(json).get))
    val combined = matches.map(_.foldLeft(List.empty[PAMatch])((acc, next) => acc ::: next.items))
    combined
  }

  private[this] def request(
      client: WSClient,
      path: String,
      params: Map[String, String],
  )(implicit executionContext: ExecutionContext): Future[List[String]] = {
    val limit = 20
    val headers = Map("apikey" -> apiKey, "Accept" -> "application/json")

    val request = client
      .url(basePath + path)
      .addHttpHeaders(headers.toSeq: _*)
      .addQueryStringParameters(params.toSeq: _*)

    def hasNext(json: String): Boolean = (Json.parse(json) \ "hasNext").getOrElse(JsBoolean(false)) == JsBoolean(true)

    def req(offset: Int): Future[(Boolean, String)] = {
      val pageParams = params + ("offset" -> offset.toString) + ("limit" -> limit.toString)
      val request = client
        .url(basePath + path)
        .addHttpHeaders(headers.toSeq: _*)
        .addQueryStringParameters(pageParams.toSeq: _*)

      val resp = request
        .get()
        .map(resp => {
          resp.status match {
            case 200 => {
              log.debug(s"GET $path OFFSET $offset")
              resp.body
            }
            case _ => {
              log.debug(s"GET FAILED $path")
              throw PARugbyAPIException(s"request for $path failed (status: ${resp.status}, body: ${resp.body})")
            }
          }
        })

      resp.map(body => (hasNext(body), body))
    }

    cycle(0, limit, Nil, req)
  }

  private[this] def cycle[A](
      offset: Int,
      limit: Int,
      acc: List[A],
      req: (Int) => Future[(Boolean, A)],
  )(implicit executionContext: ExecutionContext): Future[List[A]] = {

    req(offset).flatMap({
      case (hasNext, res) if hasNext => cycle(offset + limit, limit, res :: acc, req)
      case (_, res)                  => Future.successful(res :: acc)
    })
  }
}
