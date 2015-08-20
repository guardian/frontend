package rugby.feed

import common.{ExecutionContexts, Logging}
import play.api.Play.current
import play.api.libs.ws.{WSRequest, WS}
import rugby.jobs.RugbyStatsJob
import rugby.model.Match

import scala.concurrent.Future

case class RugbyOptaFeedException(message: String) extends RuntimeException(message)

object OptaFeed extends ExecutionContexts with Logging {
  private val xmlContentType = ("Accept", "application/xml")

  private def getResponse(feedParameter: String): Future[String] = {

    val endpointOpt = conf.SportConfiguration.optaRugby.endpoint
    endpointOpt.map { endpoint =>
      val friendlyCompetition= "competition" -> "3"
      val season = "season_id" -> "2016"
      val apiKey = "psw" -> conf.SportConfiguration.optaRugby.apiKey.getOrElse("")
      val apiUser = "user" -> conf.SportConfiguration.optaRugby.apiUser.getOrElse("")
      val feedType = "feed_type" -> feedParameter

      WS.url(endpoint)
        .withHeaders(xmlContentType)
        .withQueryString(friendlyCompetition, season, apiKey,
          apiUser, feedType)
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

  def getLiveScores: Future[Seq[Match]] = getResponse("ru5").map(Parser.parseLiveScores)

  def getFixturesAndResults: Future[Seq[Match]] = getResponse("ru1").map(Parser.parseFixturesAndResults)

  def getLiveScore(year: String, month: String, day: String, team1: String, team2: String) = RugbyStatsJob.getLiveScore(year, month, day, team1, team2)
  def getFixturesAndResults(year: String, month: String, day: String, team1: String, team2: String) = RugbyStatsJob.getFixturesAndResultScore(year, month, day, team1, team2)

}
