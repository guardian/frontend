package controllers

import common.{GuLogging, ImplicitControllerExecutionContext}
import conf.Configuration
import play.api.http.HeaderNames.AUTHORIZATION
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc._

import scala.concurrent.Future
import scala.util.control.NonFatal

/** Server-side proxy for the Feast API's "Saved from web" feature.
  *
  * DCR-rendered article pages are served from Frontend's reader-facing domains (eg. www.theguardian.com), whereas the
  * Feast API is a separate, third-party-facing origin. Browsers call these endpoints with a same-origin relative fetch,
  * and Frontend forwards the reader's own bearer token (currently an Okta access token obtained client-side) on to the
  * Feast API verbatim. Frontend holds no credentials of its own for this call - it is a pure pass-through - so that the
  * Feast API never needs to support CORS for our reader-facing origins.
  */
class FeastSavedRecipesController(val controllerComponents: ControllerComponents, wsClient: WSClient)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val MaxSavedFromWebIdsPerRequest = 5

  private def feastApiOrigin: String =
    if (Configuration.environment.isProd) "https://recipes.guardianapis.com"
    else "https://recipes.code.dev-guardianapis.com"

  private def withAuthorizationHeader(request: Request[AnyContent])(
      block: String => Future[Result],
  ): Future[Result] =
    request.headers.get(AUTHORIZATION) match {
      case Some(authorizationHeader) => block(authorizationHeader)
      case None => Future.successful(Unauthorized(Json.obj("error" -> "Missing Authorization header")))
    }

  private def upstreamErrorResult(
      action: String,
  )(implicit request: RequestHeader): PartialFunction[Throwable, Result] = { case NonFatal(error) =>
    logErrorWithRequestId(s"Feast API request failed while trying to $action", error)
    BadGateway(Json.obj("error" -> s"Failed to $action via the Feast API"))
  }

  def getSavedRecipes(ids: Option[String]): Action[AnyContent] =
    Action.async { implicit request =>
      ids.map(_.trim).filter(_.nonEmpty) match {
        case None =>
          Future.successful(BadRequest(Json.obj("error" -> "Missing required 'ids' query parameter")))

        case Some(commaSeparatedIds) if commaSeparatedIds.split(",").length > MaxSavedFromWebIdsPerRequest =>
          Future.successful(
            BadRequest(
              Json.obj("error" -> s"A maximum of $MaxSavedFromWebIdsPerRequest ids can be requested at once"),
            ),
          )

        case Some(commaSeparatedIds) =>
          withAuthorizationHeader(request) { authorizationHeader =>
            wsClient
              .url(s"$feastApiOrigin/v2/saved-from-web")
              .withHttpHeaders(AUTHORIZATION -> authorizationHeader)
              .withQueryStringParameters("ids" -> commaSeparatedIds)
              .get()
              .map(response => Status(response.status)(response.body).as(JSON))
              .recover(upstreamErrorResult("fetch saved recipes"))
          }
      }
    }

  def saveRecipe(recipeId: String): Action[AnyContent] =
    Action.async { implicit request =>
      withAuthorizationHeader(request) { authorizationHeader =>
        wsClient
          .url(s"$feastApiOrigin/v2/saved-from-web/$recipeId")
          .withHttpHeaders(AUTHORIZATION -> authorizationHeader)
          .withBody("")
          .withMethod("PUT")
          .execute()
          .map { response =>
            if (response.status == 204) NoContent
            else Status(response.status)(response.body).as(JSON)
          }
          .recover(upstreamErrorResult("save recipe"))
      }
    }
}
