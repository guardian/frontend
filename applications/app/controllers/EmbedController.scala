package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.mvc._

import scala.concurrent.Future
import contentapi.ContentApiClient
import play.api.Environment

class EmbedController(contentApiClient: ContentApiClient)(implicit env: Environment) extends Controller with Logging with ExecutionContexts {

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Left(model) => renderVideo(EmbedPage(model, model.trail.headline))
      case Right(other) => renderOther(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    log.info(s"Fetching video: $path for edition $edition")

    val response: Future[ItemResponse] = contentApiClient.getResponse(contentApiClient.item(path, edition)
      .showFields("all")
    )

    val result = response map { response =>
      val modelOption: Option[Video] = response.content.map(Content(_)).collect{ case v: Video => v }

      modelOption match {
        case Some(x) => Left(x)
        case _ => Right(NotFound)
      }
    }

    result recover convertApiExceptions
  }

  private def renderOther(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case 410 => Cached(60)(WithoutRevalidationResult(Gone(views.html.videoEmbedMissing())))
    case _ => result
  }

  private def renderVideo(model: EmbedPage)(implicit request: RequestHeader): Result = {
    Cached(600)(RevalidatableResult.Ok(views.html.videoEmbed(model)))
  }
}
