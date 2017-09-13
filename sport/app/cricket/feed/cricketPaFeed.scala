package conf.cricketPa

import akka.actor.ActorSystem
import common.Logging
import cricket.feed.{CricketThrottler, ThrottledTask}
import org.joda.time.LocalDate
import org.joda.time.format.{DateTimeFormat, DateTimeFormatter}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.XML

case class CricketFeedException(message: String) extends RuntimeException(message)

object PaFeed {
  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd")
}

class PaFeed(wsClient: WSClient, actorSystem: ActorSystem) extends Logging {

  private val paEndpoint = "http://cricket.api.press.net/v1"
  private val credentials = conf.SportConfiguration.pa.cricketKey.map { ("Apikey", _) }
  private val xmlContentType = ("Accept","application/xml")
  private implicit val throttler = new CricketThrottler(actorSystem)

  private def getMatchPaResponse(apiMethod: String)(implicit executionContext: ExecutionContext): Future[String] = {
    credentials.map ( header => ThrottledTask {
      val endpoint = s"$paEndpoint/$apiMethod"
      wsClient.url(endpoint)
        .withHttpHeaders(header, xmlContentType)
        .get
        .map { response =>
          response.status match {
          case 200 => response.body
          case _ =>
            val error = s"PA endpoint returned: ${response.status}, $endpoint"
            log.warn(error)
            throw CricketFeedException(error)
          }
      }
    }).getOrElse(Future.failed(CricketFeedException("No cricket api key found")))
  }

  def getMatch(matchId: String)(implicit executionContext: ExecutionContext): Future[cricketModel.Match] = {
    for {
      lineups: String  <- getMatchPaResponse(s"match/$matchId/line-ups")
      details: String <- getMatchPaResponse(s"match/$matchId")
      scorecard: String <- getMatchPaResponse(s"match/$matchId/scorecard")
    } yield {
      Parser.parseMatch(scorecard, details, lineups, matchId)
    }
  }

  def getMatchIds(team: CricketTeam)(implicit executionContext: ExecutionContext): Future[Seq[String]] = {

    // Get fixtures for England for today.
    val fixtures = getTeamMatches(team, "fixtures", LocalDate.now, LocalDate.now)

    // Get results for England over the last year.
    val results = getTeamMatches(team, "results", LocalDate.now.minusYears(1), LocalDate.now)

    Future.sequence(Seq(fixtures, results)).map(_.flatten)
  }

  private def getTeamMatches(team: CricketTeam, matchType: String, startDate: LocalDate, endDate: LocalDate)(implicit executionContext: ExecutionContext): Future[Seq[String]] =
    credentials.map ( header => ThrottledTask {
      val start = PaFeed.dateFormat.print(startDate)
      val end = PaFeed.dateFormat.print(endDate)
      val endpoint = s"$paEndpoint/team/${team.paId}/$matchType"

      wsClient.url(endpoint)
        .withHttpHeaders(header, xmlContentType)
        .withQueryStringParameters(("startDate", start),("endDate", end))
        .get
        .map { response =>

        response.status match {
          case 200 => XML.loadString(response.body) \\ "match" map (content =>
            (content \ "@id").text )

          case 204 => Nil // No content for this date range.

          case _ => throw CricketFeedException(s"PA endpoint returned: ${response.status} $start $end $endpoint")
        }
      }
    }).getOrElse(Future.failed(CricketFeedException("No cricket api key found")))

}
