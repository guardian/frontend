package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.ws.WSClient

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

trait PuzzlesArchiveApi {
  def get(
      startDate: LocalDate,
      endDate: LocalDate,
      puzzleType: String,
      authorization: Option[String] = None,
  )(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[PuzzlesApiItem]]
}

class PuzzlesArchiveApiClient(wsClient: WSClient) extends PuzzlesArchiveApi with GuLogging {
  override def get(
      startDate: LocalDate,
      endDate: LocalDate,
      puzzleType: String,
      authorization: Option[String],
  )(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[PuzzlesApiItem]] = {
    val archiveUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/archive"

    errorLoggingF(
      s"Puzzles archive request failed: url=$archiveUrl, startDate=$startDate, endDate=$endDate, puzzleType=$puzzleType",
    ) {
      wsClient
        .url(archiveUrl)
        .withHttpHeaders(requestHeaders(authorization): _*)
        .withQueryStringParameters(
          "startDate" -> startDate.toString,
          "endDate" -> endDate.toString,
          "puzzleType" -> puzzleType,
        )
        .withRequestTimeout(3.seconds)
        .get()
        .flatMap { response =>
          if (response.status >= 200 && response.status < 300) {
            response.json
              .validate[PuzzlesApiResponse]
              .fold(
                errors => Future.failed(new IllegalArgumentException(s"Invalid puzzles archive response: $errors")),
                value => Future.successful(value.results),
              )
          } else {
            Future.failed(
              new RuntimeException(
                s"Puzzles archive returned HTTP ${response.status}: ${response.body.take(500)}",
              ),
            )
          }
        }
    }
  }

  private def requestHeaders(authorization: Option[String]): Seq[(String, String)] =
    Seq("X-Api-Key" -> Configuration.puzzlesApi.apiKey, "Accept" -> "application/json") ++
      authorization.map("Authorization" -> _)
}
