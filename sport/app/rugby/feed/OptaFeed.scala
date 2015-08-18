package rugby.feed

import common.{ExecutionContexts, Logging}
import play.api.Play.current
import play.api.libs.ws.{WSRequest, WS}
import rugby.jobs.RugbyStatsJob
import rugby.model.LiveScore

import scala.concurrent.Future

case class RugbyOptaFeedException(message: String) extends RuntimeException(message)

object OptaFeed extends ExecutionContexts with Logging {



  private val xmlContentType = ("Accept", "application/xml")

  private def getLiveScoresResponse: Future[String] = {

    val endpoint = conf.Configuration.optaRugby.endpoint
    endpoint.map { e =>
      WS.url(e)
        .withHeaders(xmlContentType)
        .withQueryString("competition" -> "3", "season_id" -> "2016", "psw" -> conf.Configuration.optaRugby.apiKey.getOrElse(""),
          "user" -> conf.Configuration.optaRugby.apiUser.getOrElse(""), "feed_type" -> "ru5")
        .get
        .map { response =>
        response.status match {
          case 200 => response.body
          case _ => {
            val error = s"Opta endpoint returned: ${response.status}, $endpoint"
            log.warn(error)
            throw RugbyOptaFeedException(error)
          }
        }
      }
    }.getOrElse(Future.failed(RugbyOptaFeedException("No endpoint for rugby found")))
  }

  def getLiveScores: Future[Seq[LiveScore]] = getLiveScoresResponse.map(Parser.parseLiveScores)

  def getLiveScore(year: String, month: String, day: String, homeTeamId: String, awayTeamId: String) = RugbyStatsJob.getLiveScore(s"$year/$month/$day/$homeTeamId/$awayTeamId")

}
