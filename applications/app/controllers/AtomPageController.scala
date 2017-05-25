package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common._
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model._
import play.api.mvc._
import play.twirl.api.Html
import scala.concurrent.Future
import scala.concurrent.duration._
import contentapi.ContentApiClient
import model.content._
import views.html.fragments.atoms.{ media => MediaAtomBody, storyquestions => StoryQuestionsAtomBody }

class AtomPageController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  def notYetImplemented = NoCache(NotFound)

  def render(atomType: String, id: String, isJsEnabled: Boolean) = Action.async { implicit request =>

    lookup(s"atom/$atomType/$id") map {
      case Left(model: MediaAtom) =>
        renderAtom(
          MediaAtomPage(model, withJavaScript = isJsEnabled),
          MediaAtomBody(model, displayCaption = false, mediaWrapper = Some(MediaWrapper.EmbedPage))
        )
      case Left(model: StoryQuestionsAtom) =>
        renderAtom(
          StoryQuestionsAtomPage(model, withJavaScript = isJsEnabled),
          StoryQuestionsAtomBody(model, isAmp = false)
        )
      case Left(model: Quiz) =>             notYetImplemented
      case Left(model: InteractiveAtom) =>  notYetImplemented
      case Left(model: RecipeAtom) =>       notYetImplemented
      case Left(model: ReviewAtom) =>       notYetImplemented
      case Left(model: ExplainerAtom) =>    notYetImplemented
      case Right(other) =>                  renderOther(other)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Either[Atom, Result]] = {
    val edition = Edition(request)
    contentApiClient.getResponse(contentApiClient.item(path, edition))
      .map(makeAtom _ andThen { _.toLeft(NotFound) })
      .recover(convertApiExceptions)
  }

  def makeAtom(apiAtom: ItemResponse): Option[Atom] = {
    apiAtom.media.map(atom => MediaAtom.make(atom = atom, endSlatePath = None)) orElse
    apiAtom.storyquestions.map(atom => StoryQuestionsAtom.make(atom))           orElse
    /*
    apiAtom.quiz.map(atom => Quiz.make(atom))                                   orElse
    apiAtom.interactive.map(atom => InteractiveAtom.make(atom))                 orElse
    apiAtom.review.map(atom => RecipeAtom.make(atom))                           orElse
    apiAtom.recipe.map(atom => ReviewAtom.make(atom))                           orElse
    */
    None
  }

  private def renderOther(result: Result)(implicit request: RequestHeader) = result.header.status match {
    case 404 => NoCache(NotFound)
    case 410 => Cached(24.hours)(WithoutRevalidationResult(Gone(views.html.videoEmbedMissing())))
    case _ => result
  }

  private def renderAtom(page: AtomPage, body: Html)(implicit request: RequestHeader): Result = {
    Cached(600)(RevalidatableResult.Ok(views.html.atomEmbed(page, body)))
  }
}
