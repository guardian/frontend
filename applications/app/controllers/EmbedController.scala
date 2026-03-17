package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.mvc._
import scala.concurrent.Future
import contentapi.ContentApiClient

class EmbedController(contentApiClient: ContentApiClient, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def render(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      lookup(path) map {
        case Right(model) => renderVideo(EmbedPage(model, model.trail.headline))
        case Left(other)  => renderOther(other)
      }
    }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[Result, Video]] = {
    val edition = Edition(request)

    logDebugWithRequestId(s"Fetching video: $path for edition $edition")

    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient
        .item(path, edition)
        .showFields("all"),
    )

    val result = response map { response =>
      val modelOption: Option[Video] = response.content.map(Content(_)).collect { case v: Video => v }

      modelOption match {
        case Some(x) => Right(x)
        case _       => Left(NotFound)
      }
    }

    result recover convertApiExceptions
  }

  private def renderOther(result: Result)(implicit request: RequestHeader): Result =
    result.header.status match {
      case 404 => NoCache(NotFound)
      case 410 => Cached(60)(WithoutRevalidationResult(Gone(views.html.videoEmbedMissing())))
      case _   => result
    }

  private def renderVideo(model: EmbedPage)(implicit request: RequestHeader): Result = {
    Cached(600)(RevalidatableResult.Ok(views.html.videoEmbed(model)))
  }
}
