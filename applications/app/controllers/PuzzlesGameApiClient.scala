package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.ws.WSClient

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

trait PuzzlesGameApi {
  def get(puzzleType: String, date: LocalDate)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[PuzzlesApiItem]]
}

/** Public page data is fetched anonymously; DCR adds the reader's identity after hydration. */
class PuzzlesGameApiClient(wsClient: WSClient) extends PuzzlesGameApi with GuLogging {
  override def get(puzzleType: String, date: LocalDate)(implicit
      executionContext: ExecutionContext,
  ): Future[Option[PuzzlesApiItem]] = {
    val url = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/game"
    errorLoggingF(s"Puzzles game request failed: puzzleType=$puzzleType, date=$date") {
      wsClient
        .url(url)
        .withHttpHeaders("X-Api-Key" -> Configuration.puzzlesApi.apiKey, "Accept" -> "application/json")
        .withQueryStringParameters("puzzleType" -> puzzleType, "date" -> date.toString)
        .withRequestTimeout(3.seconds)
        .get()
        .flatMap { response =>
          response.status match {
            case 404 => Future.successful(None)
            case 200 =>
              response.json
                .validate[PuzzlesApiItem]
                .fold(
                  errors => Future.failed(new IllegalArgumentException(s"Invalid puzzles game response: $errors")),
                  item =>
                    if (item.puzzleType == puzzleType && item.publishDate.take(10) == date.toString)
                      Future.successful(Some(item))
                    else Future.failed(new IllegalArgumentException("Puzzles game response does not match the request")),
                )
            case status => Future.failed(new RuntimeException(s"Puzzles game returned HTTP $status"))
          }
        }
    }
  }
}
