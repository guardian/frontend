package conf.cricketPa

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import common.Chronos
import common.GuLogging
import cricket.feed.CricketThrottler
import org.apache.pekko.stream.Materializer

import java.time.{LocalDate, ZoneId}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.XML

case class CricketFeedException(message: String) extends RuntimeException(message)

object PaFeed {
  val dateFormat = Chronos.dateFormatter("yyyy-MM-dd", ZoneId.of("UTC"))
}

class PaFeed(wsClient: WSClient, pekkoActorSystem: PekkoActorSystem, materializer: Materializer) extends GuLogging {

  private val paEndpoint = "https://cricket-api.guardianapis.com/v1"
  private val credentials = conf.SportConfiguration.pa.cricketKey.map { ("Apikey", _) }
  private val xmlContentType = ("Accept", "application/xml")
  private implicit val throttler: CricketThrottler = new CricketThrottler(pekkoActorSystem, materializer)

  private def getMatchPaResponse(apiMethod: String)(implicit executionContext: ExecutionContext): Future[String] = {
    credentials
      .map(header =>
        throttler.throttle { () =>
          val endpoint = s"$paEndpoint/$apiMethod"
          wsClient
            .url(endpoint)
            .withHttpHeaders(header, xmlContentType)
            .get()
            .map { response =>
              response.status match {
                case 200 => response.body
                case _   =>
                  val error = s"PA endpoint returned: ${response.status}, $endpoint"
                  log.warn(error)
                  throw CricketFeedException(error)
              }
            }
        },
      )
      .getOrElse(Future.failed(CricketFeedException("No cricket api key found")))
  }

  def getMatch(matchId: String)(implicit executionContext: ExecutionContext): Future[cricketModel.Match] = {
    for {
      lineups: String <- getMatchPaResponse(s"match/$matchId/line-ups")
      details: String <- getMatchPaResponse(s"match/$matchId")
      scorecard: String <- getMatchPaResponse(s"match/$matchId/scorecard")
    } yield {
      Parser.parseMatch(scorecard, details, lineups, matchId)
    }
  }

  def getMatchIds(team: CricketTeam, fromDate: LocalDate)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[String]] = {
    Future
      .sequence(
        Seq(
          getTeamMatches(team, "fixtures", fromDate, LocalDate.now),
          getTeamMatches(team, "results", fromDate, LocalDate.now),
        ),
      )
      .map(_.flatten)
  }

  private def getTeamMatches(team: CricketTeam, matchType: String, startDate: LocalDate, endDate: LocalDate)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[String]] = {

    credentials
      .map(header =>
        throttler.throttle { () =>
          val start = PaFeed.dateFormat.format(startDate)
          val end = PaFeed.dateFormat.format(endDate)
          val endpoint = s"$paEndpoint/team/${team.paId}/$matchType"

          wsClient
            .url(endpoint)
            .withHttpHeaders(header, xmlContentType)
            .withQueryStringParameters(("startDate", start), ("endDate", end))
            .get()
            .map { response =>
              response.status match {
                case 200 => XML.loadString(response.body) \\ "match" map (content => (content \ "@id").text)

                case 204 => Nil // No content for this date range.

                case _ => throw CricketFeedException(s"PA endpoint returned: ${response.status} $start $end $endpoint")
              }
            }
        },
      )
      .getOrElse(Future.failed(CricketFeedException("No cricket api key found")))
  }
}
