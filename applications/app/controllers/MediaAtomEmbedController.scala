package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentatom.thrift.{Atom => ApiAtom}
import common._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.mvc._
import scala.concurrent.Future
import contentapi.ContentApiClient
import model.content.MediaAtom

class MediaAtomEmbedController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {
  import context._

  def render(id: String) = Action.async { implicit request =>
    lookup(s"atom/media/$id") map {
      case Left(model) => renderMediaAtom(model)
      case Right(other) => renderOther(other)
    }
  }

  def make(apiAtom: Option[ApiAtom]): Option[MediaAtom] = apiAtom map MediaAtom.make

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    val response: Future[ItemResponse] = contentApiClient.getResponse(contentApiClient.item(path, edition))

    val result = response map { response =>
      make(response.media) match  {
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

  private def renderMediaAtom(model: MediaAtom)(implicit request: RequestHeader): Result = {

    val page: MediaAtomEmbedPage = MediaAtomEmbedPage(model)

    Cached(600)(RevalidatableResult.Ok(views.html.fragments.atoms.mediaEmbed(page, displayCaption = false)))
  }
}
