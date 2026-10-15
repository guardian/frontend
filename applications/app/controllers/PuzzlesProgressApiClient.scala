package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.json.{JsValue, Json}
import play.api.libs.ws.WSClient

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

/** The upstream status and (when it is JSON) body returned by the Puzzles API. */
case class PuzzlesProgressApiResponse(status: Int, body: Option[JsValue])

trait PuzzlesProgressApi {
  def query(
      date: LocalDate,
      puzzleTypes: Seq[String],
      authorization: Option[String] = None,
  )(implicit
      executionContext: ExecutionContext,
  ): Future[Seq[PuzzlesApiItem]]

  /** Forwards a batch of progress updates to `PUT /progress` on behalf of the signed-in reader.
    *
    * @param authorization
    *   the reader's own `Authorization` header, passed through untouched. The Puzzles API verifies it and derives the
    *   identity from it, so the identity is never taken from the request body.
    */
  def save(authorization: String, updates: JsValue)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzlesProgressApiResponse]
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

  override def save(authorization: String, updates: JsValue)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzlesProgressApiResponse] = {
    val progressUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/progress"

    errorLoggingF(s"Puzzles progress save request failed: url=$progressUrl") {
      wsClient
        .url(progressUrl)
        // The API key is a server-side secret and must never be sent to, or logged for, the browser.
        .withHttpHeaders(requestHeaders(Some(authorization)): _*)
        .withRequestTimeout(3.seconds)
        .put(updates)
        .map { response =>
          PuzzlesProgressApiResponse(response.status, scala.util.Try(response.json).toOption)
        }
    }
  }

  private def requestHeaders(authorization: Option[String]): Seq[(String, String)] =
    Seq("X-Api-Key" -> Configuration.puzzlesApi.apiKey, "Accept" -> "application/json") ++
      authorization.map("Authorization" -> _)
}
