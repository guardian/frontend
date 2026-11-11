package controllers

import common.GuLogging
import conf.Configuration
import play.api.libs.json.{Json, Reads}
import play.api.libs.ws.WSClient

import java.time.LocalDate
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

/** What the Puzzles API says about one puzzle and the reader who asked. */
case class PuzzleAccess(isPremium: Boolean, hasAccess: Boolean)

object PuzzleAccess {
  implicit val reads: Reads[PuzzleAccess] = Json.reads[PuzzleAccess]
}

trait PuzzlesAccessApi {

  /** Asks the Puzzles API whether the reader may play a puzzle, with `GET /v1/game/{puzzleId}/access/{date}`.
    *
    * @param authorization
    *   the reader's own `Authorization` header, passed through untouched. The Puzzles API verifies it and uses it to
    *   look up the reader's benefits.
    *
    * The future only succeeds when the Puzzles API gave a valid answer. Every other outcome (a 401, 403 or 404, a 5xx,
    * a timeout, an invalid body) fails it, so a failure to find out can never be read as "no access".
    */
  def check(puzzleId: String, date: LocalDate, authorization: String)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzleAccess]
}

object PuzzlesAccessApi {

  /** The same rule the Puzzles API applies to ids (`PuzzleIdSchema`). It is also what keeps a path separator or `..`
    * out of the URL this client builds.
    */
  private val PuzzleIdPattern = java.util.regex.Pattern.compile("^[\\w-]{1,256}$")

  def isValidPuzzleId(puzzleId: String): Boolean = PuzzleIdPattern.matcher(puzzleId).matches()
}

class PuzzlesAccessApiClient(wsClient: WSClient) extends PuzzlesAccessApi with GuLogging {

  // Shorter than the 3 seconds the browser waits, so this answers (even if only with a failure) before it gives up.
  private val RequestTimeout = 2.seconds

  override def check(puzzleId: String, date: LocalDate, authorization: String)(implicit
      executionContext: ExecutionContext,
  ): Future[PuzzleAccess] =
    if (!PuzzlesAccessApi.isValidPuzzleId(puzzleId)) {
      Future.failed(new IllegalArgumentException("Refusing to ask the Puzzles API about a malformed puzzle id"))
    } else {
      val accessUrl = s"${Configuration.puzzlesApi.baseUrl.stripSuffix("/")}/v1/game/$puzzleId/access/$date"

      errorLoggingF(s"Puzzles access request failed: url=$accessUrl") {
        wsClient
          .url(accessUrl)
          // The API key is a server-side secret and must never be sent to, or logged for, the browser.
          .withHttpHeaders(
            "X-Api-Key" -> Configuration.puzzlesApi.apiKey,
            "Accept" -> "application/json",
            "Authorization" -> authorization,
          )
          .withRequestTimeout(RequestTimeout)
          .get()
          .flatMap { response =>
            if (response.status >= 200 && response.status < 300) {
              response.json
                .validate[PuzzleAccess]
                .fold(
                  errors => Future.failed(new IllegalArgumentException(s"Invalid puzzles access response: $errors")),
                  Future.successful,
                )
            } else {
              Future.failed(
                new RuntimeException(
                  s"Puzzles access returned HTTP ${response.status}: ${response.body.take(500)}",
                ),
              )
            }
          }
      }
    }
}
