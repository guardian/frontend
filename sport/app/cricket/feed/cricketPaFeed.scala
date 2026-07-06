package conf.cricketPa

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import common.Chronos
import common.GuLogging
import cricket.feed.CricketThrottler
import org.apache.pekko.stream.Materializer

import java.time.{LocalDate, LocalDateTime, ZoneId}
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}
import scala.xml.XML

case class CricketFeedException(message: String) extends RuntimeException(message)

object PaFeed {
  val dateFormat = Chronos.dateFormatter("yyyy-MM-dd", ZoneId.of("UTC"))

  val dateWindowMonths = 2
}

case class CompetitionMatch(
    matchId: String,
    competitionId: String,
    competitionName: String,
    startDate: LocalDateTime,
)

class PaFeed(wsClient: WSClient, pekkoActorSystem: PekkoActorSystem, materializer: Materializer) extends GuLogging {

  private val paEndpoint = "https://cricket-api.guardianapis.com/v1"
  private val credentials = conf.SportConfiguration.pa.cricketKey.map { ("Apikey", _) }
  private val xmlContentType = ("Accept", "application/xml")
  private implicit val throttler: CricketThrottler = new CricketThrottler(pekkoActorSystem, materializer)

  private def getMatchPaResponse(
      apiMethod: String,
  )(implicit executionContext: ExecutionContext): Future[Option[String]] = {
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
                case 200 => Some(response.body)
                case 204 => None // No content published for this match yet.
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

  def getMatch(
      competitionMatch: CompetitionMatch,
  )(implicit executionContext: ExecutionContext): Future[Option[cricketModel.Match]] = {
    for {
      lineups: Option[String] <- getMatchPaResponse(s"match/${competitionMatch.matchId}/line-ups")
      details: Option[String] <- getMatchPaResponse(s"match/${competitionMatch.matchId}")
      scorecard: Option[String] <- getMatchPaResponse(s"match/${competitionMatch.matchId}/scorecard")
    } yield {
      // If any part of the match data is unavailable (204), treat the whole match as not-yet-available.
      for {
        lineupsBody <- lineups
        detailsBody <- details
        scorecardBody <- scorecard
      } yield Parser.parseMatch(scorecardBody, detailsBody, lineupsBody, competitionMatch)
    }
  }

  def getCompetitionMatches(team: CricketTeam, fromDate: LocalDate)(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[CompetitionMatch]] = {
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
  ): Future[Seq[CompetitionMatch]] = {

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
                case 200 =>
                  val xml = XML.loadString(response.body)

                  // Iterate over each competition
                  (xml \ "competition").flatMap { comp =>
                    val compId = (comp \ "@id").text
                    val compName = (comp \ "name").text

                    // Iterate over the matches within this competition
                    (comp \ "match").map { m =>
                      val matchId = (m \ "@id").text
                      val startDate = (m \ "dateTime").text
                      CompetitionMatch(
                        matchId = matchId,
                        competitionId = compId,
                        competitionName = compName,
                        startDate = Parser.parseDate(startDate),
                      )
                    }
                  }

                case 204 => Nil // No content for this date range.

                case _ => throw CricketFeedException(s"PA endpoint returned: ${response.status} $start $end $endpoint")
              }
            }
        },
      )
      .getOrElse(Future.failed(CricketFeedException("No cricket api key found")))
  }
}
