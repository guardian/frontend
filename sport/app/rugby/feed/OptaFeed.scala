package rugby.feed

import common.{ExecutionContexts, Logging}
import play.api.Play.current
import play.api.libs.ws.{WSRequest, WS}
import rugby.model.LiveScore

import scala.concurrent.Future

case class RugbyOptaFeedException(message: String) extends RuntimeException(message)

trait OptaFeed extends ExecutionContexts with Logging {

  private val endpoint = conf.Configuration.optaRugby.endpoint

  private val xmlContentType = ("Accept", "application/xml")

  private def getLiveScoresResponse: Future[String] = {

    endpoint.map { e =>
      WS.url(e)
        .withHeaders(xmlContentType)
        .withQueryString("competition" -> "3", "season_id" -> "2016", "psw" -> conf.Configuration.optaRugby.apiKey.getOrElse(""),
          "user" -> conf.Configuration.optaRugby.apiUser.getOrElse(""), "feed_type" -> "ru5")
        .get
        .map { response =>
        response.status match {
          case 200 => {
            println(response.body)
            response.body
          }
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

}

object OptaFeed extends OptaFeed
