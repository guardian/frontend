package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentatom.thrift.{Atom => ApiAtom}
import common._
import model.Cached.RevalidatableResult
import model._
import play.api.mvc._
import scala.concurrent.Future
import contentapi.ContentApiClient
import model.content.StoryQuestionsAtom

class StoryQuestionsAtomEmbedController(
  contentApiClient: ContentApiClient
)(
  implicit context: ApplicationContext
)
  extends Controller
  with Logging
  with ExecutionContexts
{

  def render(id: String) = Action.async { implicit request =>
    lookup(s"atom/storyquestions/$id") map {
      case Left(model) => renderStoryQuestionsAtom(model)
      case Right(other) => renderOther(other)
    }
  }

  private def make(apiAtom: Option[ApiAtom]): Option[StoryQuestionsAtom] = apiAtom map StoryQuestionsAtom.make _

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val edition = Edition(request)

    val response: Future[ItemResponse] = contentApiClient.getResponse(contentApiClient.item(path, edition))

    val result = response map { response =>
      make(response.storyquestions) match  {
        case Some(x) => Left(x)
        case _ => Right(NotFound)
      }
    }
    result recover convertApiExceptions
  }

  private def renderOther(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case _ => result
  }

  private def renderStoryQuestionsAtom(model: StoryQuestionsAtom)(implicit request: RequestHeader): Result = {
    val page = StoryQuestionsAtomEmbedPage(model)
    Cached(600)(RevalidatableResult.Ok(views.html.fragments.atoms.storyQuestionsEmbed(page)))
  }
}
