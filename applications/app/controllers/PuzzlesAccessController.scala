package controllers

import common.ImplicitControllerExecutionContext
import model.{Cors, NoCache, TinyResponse}
import play.api.libs.json.Json
import play.api.mvc._

/** Answer to "may this reader play this premium puzzle?", asked by the browser with the reader's own `Authorization`
  * header (the page HTML is cached and shared, so it can only say that a puzzle is premium, see
  * [[PuzzlesAccessPolicy]], never who may play it).
  *
  * The Puzzles API does not have an access endpoint yet, so for now this always answers 503: the check is unavailable.
  * The browser treats any non-2xx answer as "could not find out" and falls back to what it knows about the reader.
  * Nothing is sent to the Puzzles API. When the upstream endpoint exists, this is where the call goes, answering
  * `{ "hasAccess": boolean }`.
  */
class PuzzlesAccessController(val controllerComponents: ControllerComponents)
    extends BaseController
    with ImplicitControllerExecutionContext {

  def access(puzzleId: String): Action[AnyContent] =
    Action { implicit request =>
      Cors(NoCache(ServiceUnavailable(Json.obj("message" -> "Puzzle access check is not available yet"))))
    }

  def options(): Action[AnyContent] = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }
}
