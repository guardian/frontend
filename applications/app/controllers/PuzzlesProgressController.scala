package controllers

import ab.PuzzlesHubExperiment
import common.{GuLogging, ImplicitControllerExecutionContext}
import play.api.libs.json.{JsArray, JsValue, Json}
import play.api.mvc._

import scala.concurrent.Future

/** Server-side proxy that lets the browser report puzzle progress to the Puzzles API without ever holding the API key.
  *
  * The browser sends the reader's own `Authorization` header. This controller only checks the shape of the request,
  * adds the API key (in [[PuzzlesProgressApi]]) and forwards the body untouched. It deliberately does not verify the
  * token: the Puzzles API does that and derives the identity from it.
  */
class PuzzlesProgressController(
    progressApi: PuzzlesProgressApi,
    val controllerComponents: ControllerComponents,
) extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  private val MaxUpdates = 100

  private def noStore(result: Result): Result = result.withHeaders(CACHE_CONTROL -> "no-store")

  def save(): Action[JsValue] =
    Action.async(parse.json) { implicit request =>
      if (!PuzzlesHubExperiment.isV1Enabled) Future.successful(noStore(NotFound))
      else
        request.headers.get(AUTHORIZATION) match {
          case None => Future.successful(noStore(Unauthorized(Json.obj("message" -> "Missing Authorization header"))))
          case Some(authorization) =>
            request.body match {
              case updates: JsArray if updates.value.nonEmpty && updates.value.size <= MaxUpdates =>
                progressApi.save(authorization, updates).map { upstream =>
                  noStore(upstream.status match {
                    case 202       => Accepted(upstream.body.getOrElse(Json.obj()))
                    case 400       => BadRequest(upstream.body.getOrElse(Json.obj("message" -> "Invalid request body")))
                    case 401 | 403 => Unauthorized(Json.obj("message" -> "Not authorised"))
                    case other     =>
                      logErrorWithRequestId(s"Puzzles progress upstream returned HTTP $other")
                      BadGateway(Json.obj("message" -> "Failed to save progress"))
                  })
                } recover { case _ =>
                  noStore(BadGateway(Json.obj("message" -> "Failed to save progress")))
                }
              case _ =>
                Future.successful(
                  noStore(BadRequest(Json.obj("message" -> s"Expected an array of 1 to $MaxUpdates progress updates"))),
                )
            }
        }
    }
}
