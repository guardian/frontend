package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{Cors, NoCache, TinyResponse}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.Future

/** Server-side answer to "may this reader play this premium puzzle?".
  *
  * The page HTML is cached and shared, so it can only say that a puzzle is premium (see [[PuzzlesAccessPolicy]]), never
  * who may play it. The browser asks this uncached endpoint, with the reader's own `Authorization` header, and it
  * answers `{ "hasAccess": boolean }`. The header is only checked for shape here and forwarded untouched: the Puzzles
  * API verifies it and works out the subscription.
  *
  * Requests are cheap to refuse: a missing `Authorization` header or a malformed `puzzleId` is rejected here without
  * calling the Puzzles API, so unauthenticated or junk traffic never reaches it.
  */
class PuzzlesAccessController(
    accessApi: PuzzlesAccessApi,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  private def respond(result: Result)(implicit request: RequestHeader): Result = Cors(NoCache(result))

  def access(puzzleId: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!PuzzlesAccessController.isValidPuzzleId(puzzleId))
        Future.successful(respond(BadRequest(Json.obj("message" -> "Invalid puzzleId"))))
      else
        request.headers.get(AUTHORIZATION) match {
          case None =>
            Future.successful(respond(Unauthorized(Json.obj("message" -> "Missing Authorization header"))))
          case Some(authorization) =>
            accessApi
              .hasAccess(puzzleId, authorization)
              .map(hasAccess => respond(Ok(Json.obj("hasAccess" -> hasAccess))))
              .recover { case _ =>
                respond(BadGateway(Json.obj("message" -> "Failed to check puzzle access")))
              }
        }
    }

  def options(): Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }
}

object PuzzlesAccessController {

  /** Puzzles API ids look like `guardian-sudoku-easy-20261009`. */
  private val PuzzleIdPattern = "^[A-Za-z0-9_-]{1,100}$".r

  def isValidPuzzleId(puzzleId: String): Boolean = PuzzleIdPattern.matches(puzzleId)
}
