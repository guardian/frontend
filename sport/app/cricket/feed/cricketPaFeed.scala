package cricketPa

import common.{ExecutionContexts, Logging}
import org.joda.time.LocalDate
import play.api.libs.ws.WS
import scala.concurrent.Future
import scala.xml.XML

case class CricketFeedException(message: String) extends RuntimeException(message)

object PaFeed extends ExecutionContexts with Logging {

  import play.api.Play.current

/*
* Needs key in the configuration
* */
  val paEndpoint = "http://cricket.api.press.net/v1"
  val englandTeamId = "a359844f-fc07-9cfa-d4cc-9a9ac0d5d075"
  val credentials = ("Apikey","needs key")

  val xmlContentType = ("Accept","application/xml")
  val startDate = new LocalDate(2014,1,1).toString("yyyy-MM-dd")

  private def getMatchPaResponse(apiMethod: String) : Future[String] = {
    val endpoint = s"$paEndpoint/$apiMethod"
    WS.url(endpoint)
      .withHeaders(credentials, xmlContentType)
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
  }

  def getMatch(matchId: String): Future[cricketModel.Match] = {
    for {
      scorecard <- getMatchPaResponse(s"match/$matchId/scorecard")
      lineups <- getMatchPaResponse(s"match/$matchId/line-ups")
      details <- getMatchPaResponse(s"match/$matchId")
    } yield {
      Parser.parseMatch(scorecard, lineups, details)
    }
  }

  def getMatchIds(): Future[Seq[String]] = {

    // Get fixtures and results for England.
    val fixtures = getTeamMatches("fixtures")

    val results = getTeamMatches("results")

    Future.sequence(Seq(fixtures, results)).map(_.flatten)
  }

  private def getTeamMatches(matchType: String): Future[Seq[String]] = {
    val currentDate = LocalDate.now.toString("yyyy-MM-dd")

    WS.url(s"$paEndpoint/team/$englandTeamId/$matchType")
      .withHeaders(credentials, xmlContentType)
      .withQueryString(("startDate", currentDate))
      .get
      .map { response =>

      response.status match {
        case 200 => { XML.loadString(response.body) \\ "match" map (content =>
          (content \ "@id").text ) }

        case _ => throw CricketFeedException(s"PA endpoint returned: ${response.status}, body:${response.body}")
      }
    }
  }
}
