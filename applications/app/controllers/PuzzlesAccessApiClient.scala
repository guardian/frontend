package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.json.JsBoolean
import play.api.libs.ws.WSClient

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

trait PuzzlesAccessApi {

  /** Asks the Puzzles API whether the signed-in reader may play a premium puzzle.
    *
    * @param authorization
    *   the reader's own `Authorization` header, passed through untouched. The Puzzles API verifies it and derives the
    *   identity and the subscription from it, so neither is ever taken from the request.
    * @return
    *   `false` when the Puzzles API rejects the credentials; fails for any other upstream problem, so the caller can
    *   tell "no access" from "could not find out".
    */
  def hasAccess(puzzleId: String, authorization: String)(implicit executionContext: ExecutionContext): Future[Boolean]
}

/** Client for the Puzzles API access check.
  *
  * NOTE: the upstream contract is the proposed one and is still to be agreed with the Puzzles API team:
  * `GET {puzzlesApi.baseUrl}/access?puzzleId=<id>` answering `{ "hasAccess": boolean }`. Until it exists upstream, this
  * fails with an upstream error, which the browser treats as "could not find out".
  */
class PuzzlesAccessApiClient(wsClient: WSClient) extends PuzzlesAccessApi with GuLogging {

  override def hasAccess(puzzleId: String, authorization: String)(implicit
      executionContext: ExecutionContext,
  ): Future[Boolean] = {
    val accessUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/access"

    errorLoggingF(s"Puzzles access request failed: url=$accessUrl, puzzleId=$puzzleId") {
      wsClient
        .url(accessUrl)
        .withQueryStringParameters("puzzleId" -> puzzleId)
        // The API key is a server-side secret and must never be sent to, or logged for, the browser.
        .withHttpHeaders(
          "X-Api-Key" -> Configuration.puzzlesApi.apiKey,
          "Accept" -> "application/json",
          "Authorization" -> authorization,
        )
        .withRequestTimeout(3.seconds)
        .get()
        .flatMap { response =>
          response.status match {
            case status if status >= 200 && status < 300 =>
              (response.json \ "hasAccess").toOption match {
                case Some(JsBoolean(value)) => Future.successful(value)
                case _ => Future.failed(new IllegalArgumentException("Invalid puzzles access response"))
              }
            case 401 | 403 => Future.successful(false)
            case status    =>
              Future.failed(
                new RuntimeException(s"Puzzles access returned HTTP $status: ${response.body.take(500)}"),
              )
          }
        }
    }
  }
}
