package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{Cors, NoCache, TinyResponse}
import play.api.libs.json.Json
import play.api.mvc._

import java.time.LocalDate
import scala.concurrent.Future
import scala.util.Try

/** Answer to "may this reader play this puzzle?", asked by the browser with the reader's own `Authorization` header
  * (the page HTML is cached and shared, so it can only say that a puzzle is premium, see [[PuzzlesAccessPolicy]], never
  * who may play it).
  *
  * This only checks the shape of the request, adds the API key (in [[PuzzlesAccessApi]]) and relays the question to the
  * Puzzles API, which owns the rule and decides. It deliberately does not verify the token itself.
  *
  * The answer is `{ "hasAccess": boolean }` and nothing else. Anything that stops the Puzzles API giving a valid answer
  * is a 503, never "denied": the browser treats any non-2xx answer as "could not find out" and falls back to what it
  * knows about the reader, so a failure on our side can never lock a subscriber out or unlock everything.
  */
class PuzzlesAccessController(
    accessApi: PuzzlesAccessApi,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  private val IsoDate = """^\d{4}-\d{2}-\d{2}$""".r

  private def parseDate(date: String): Option[LocalDate] =
    IsoDate.findFirstIn(date).flatMap(value => Try(LocalDate.parse(value)).toOption)

  def access(puzzleId: String, date: String): Action[AnyContent] =
    Action.async { implicit request =>
      def respond(result: Result): Result = Cors(NoCache(result))

      request.headers.get(AUTHORIZATION).filter(_.trim.nonEmpty) match {
        case None =>
          Future.successful(respond(Unauthorized(Json.obj("message" -> "Missing Authorization header"))))

        case Some(authorization) =>
          parseDate(date) match {
            case Some(parsedDate) if PuzzlesAccessApi.isValidPuzzleId(puzzleId) =>
              accessApi
                .check(puzzleId, parsedDate, authorization)
                .map(access => respond(Ok(Json.obj("hasAccess" -> access.hasAccess))))
                .recover { case error =>
                  log.warn(s"Puzzle access check unavailable for puzzleId=$puzzleId: ${error.getMessage}")
                  respond(ServiceUnavailable(Json.obj("message" -> "Puzzle access check is unavailable")))
                }

            case _ =>
              Future.successful(
                respond(BadRequest(Json.obj("message" -> "Expected a puzzleId and a date as YYYY-MM-DD"))),
              )
          }
      }
    }

  def options(): Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }
}
