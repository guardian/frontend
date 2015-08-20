package cricketPa

import common.{ExecutionContexts, Logging}
import cricket.feed.ThrottledTask
import cricketModel.Match
import jobs.CricketStatsJob
import org.joda.time.LocalDate
import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}
import play.api.libs.ws.WS
import scala.concurrent.Future
import scala.xml.XML

case class CricketFeedException(message: String) extends RuntimeException(message)

object PaFeed extends ExecutionContexts with Logging {

  import play.api.Play.current

  val dateFormat: DateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd")
  private val paEndpoint = "http://cricket.api.press.net/v1"
  private val englandTeamId = "a359844f-fc07-9cfa-d4cc-9a9ac0d5d075"
  private val credentials = conf.SportConfiguration.pa.cricketKey.map { ("Apikey", _) }
  private val xmlContentType = ("Accept","application/xml")

  private def getMatchPaResponse(apiMethod: String) : Future[String] = {
    credentials.map ( header => ThrottledTask {
      val endpoint = s"$paEndpoint/$apiMethod"
      WS.url(endpoint)
        .withHeaders(header, xmlContentType)
        .get
        .map { response => response.status match {
          case 200 => response.body
          case _ => {
            val error = s"PA endpoint returned: ${response.status}, $endpoint"
            log.warn(error)
            throw CricketFeedException(error)
          }
        }
      }
    }).getOrElse(Future.failed(CricketFeedException("No cricket api key found")))
  }

  def getMatch(matchId: String): Future[cricketModel.Match] = {
    for {
      lineups: String  <- getMatchPaResponse(s"match/$matchId/line-ups")
      details: String <- getMatchPaResponse(s"match/$matchId")
      scorecard: String <- getMatchPaResponse(s"match/$matchId/scorecard")
    } yield {
      Parser.parseMatch(scorecard, details, lineups, matchId)
    }
  }

  def getEnglandMatchIds(): Future[Seq[String]] = {

    // Get fixtures for England for today.
    val fixtures = getTeamMatches("fixtures", LocalDate.now, LocalDate.now)

    // Get results for England over the last year.
    val results = getTeamMatches("results", LocalDate.now.minusYears(1), LocalDate.now)

    Future.sequence(Seq(fixtures, results)).map(_.flatten)
  }

  private def getTeamMatches(matchType: String, startDate: LocalDate, endDate: LocalDate): Future[Seq[String]] =
    credentials.map ( header => ThrottledTask {
      val start = dateFormat.print(startDate)
      val end = dateFormat.print(endDate)
      val endpoint = s"$paEndpoint/team/$englandTeamId/$matchType"

      WS.url(endpoint)
        .withHeaders(header, xmlContentType)
        .withQueryString(("startDate", start),("endDate", end))
        .get
        .map { response =>

        response.status match {
          case 200 => { XML.loadString(response.body) \\ "match" map (content =>
            (content \ "@id").text ) }

          case 204 => Nil // No content for this date range.

          case _ => throw CricketFeedException(s"PA endpoint returned: ${response.status} $start $end $endpoint")
        }
      }
    }).getOrElse(Future.failed(CricketFeedException("No cricket api key found")))

  def findMatchFromDate(date: String): Option[Match] = {
    // A test match runs over 5 days, so check the dates for the whole period.
    val requestDate = dateFormat.parseLocalDate(date)

    val matchObjects = for {
      day <- 0 until 5
      date <- Some(dateFormat.print(requestDate.minusDays(day)))
    } yield {
      CricketStatsJob.getMatch(date)
    }
    matchObjects.flatten.headOption
  }
}
