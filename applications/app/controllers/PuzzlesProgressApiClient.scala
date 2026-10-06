package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.json.JsValue
import play.api.libs.ws.WSClient

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

/** The upstream status and (when it is JSON) body returned by the Puzzles API. */
case class PuzzlesProgressApiResponse(status: Int, body: Option[JsValue])

trait PuzzlesProgressApi {

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
  override def save(authorization: String, updates: JsValue)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzlesProgressApiResponse] = {
    val progressUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/progress"

    errorLoggingF(s"Puzzles progress request failed: url=$progressUrl") {
      wsClient
        .url(progressUrl)
        .withHttpHeaders(
          // The API key is a server-side secret and must never be sent to, or logged for, the browser.
          "X-Api-Key" -> Configuration.puzzlesApi.apiKey,
          "Authorization" -> authorization,
          "Accept" -> "application/json",
        )
        .withRequestTimeout(3.seconds)
        .put(updates)
        .map { response =>
          PuzzlesProgressApiResponse(response.status, scala.util.Try(response.json).toOption)
        }
    }
  }
}
