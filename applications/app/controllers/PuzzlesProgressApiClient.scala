package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.json.Json
import play.api.libs.ws.WSClient

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

trait PuzzlesProgressApi {
  def query(
      date: LocalDate,
      puzzleTypes: Seq[String],
      authorization: Option[String] = None,
  )(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[PuzzlesApiItem]]
}

class PuzzlesProgressApiClient(wsClient: WSClient) extends PuzzlesProgressApi with GuLogging {
  override def query(
      date: LocalDate,
      puzzleTypes: Seq[String],
      authorization: Option[String],
  )(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[PuzzlesApiItem]] = {
    val progressUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/progress/query"
    val payload = Json.obj(
      "date" -> s"${date}T00:00:00Z",
      "puzzleTypes" -> puzzleTypes,
    )

    errorLoggingF(
      s"Puzzles progress request failed: url=$progressUrl, date=$date, puzzleTypes=${puzzleTypes.mkString(",")}",
    ) {
      wsClient
        .url(progressUrl)
        .withHttpHeaders(requestHeaders(authorization): _*)
        .withRequestTimeout(3.seconds)
        .post(payload)
        .flatMap { response =>
          if (response.status >= 200 && response.status < 300) {
            response.json
              .validate[PuzzlesApiResponse]
              .fold(
                errors => Future.failed(new IllegalArgumentException(s"Invalid puzzles progress response: $errors")),
                value => Future.successful(value.results),
              )
          } else {
            Future.failed(
              new RuntimeException(
                s"Puzzles progress returned HTTP ${response.status}: ${response.body.take(500)}",
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
