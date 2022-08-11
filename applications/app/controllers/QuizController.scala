package controllers

import common._
import conf.Configuration
import contentapi.ContentApiClient
import model._
import model.content.{Atoms, QuizAtom}
import pages.ContentHtmlPage
import play.api.mvc._
import quiz.form
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class QuizAnswersPage(inputs: form.Inputs, contentPage: String, quiz: QuizAtom) extends model.StandalonePage {
  override val metadata = MetaData.make("quiz atom", Some(SectionId.fromId("quizzes")), quiz.title)

  val results: form.QuizResults = form.checkUsersAnswers(inputs, quiz)

  private val knowledgeShares: Seq[ShareLink] = {
    val twitterMessage = s"I scored ${results.knowledgeScore}/${quiz.content.questions.size} in ${quiz.title} @guardian"

    Seq(
      ShareLinks.createShareLink(Facebook, href = contentPage, title = "", mediaPath = None),
      ShareLinks.createShareLink(Twitter, href = contentPage, title = twitterMessage, mediaPath = None),
    )
  }

  private val personalityShares: Seq[ShareLink] = {
    val twitterMessage = s"${results.resultGroup.map(_.shareText).getOrElse("")} @guardian"

    Seq(
      ShareLinks.createShareLink(Facebook, href = contentPage, title = "", mediaPath = None),
      ShareLinks.createShareLink(Twitter, href = contentPage, title = twitterMessage, mediaPath = None),
    )
  }

  val shares: ShareLinkMeta =
    if (results.isKnowledge) ShareLinkMeta(knowledgeShares, Nil) else ShareLinkMeta(personalityShares, Nil)
}

class QuizController(
    contentApiClient: ContentApiClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with GuLogging {

  def submit(quizId: String, path: String): Action[AnyContent] =
    Action.async { implicit request =>
      form.playForm
        .bindFromRequest()
        .fold(
          hasErrors = errors => {
            val errorMessages = errors.errors.flatMap(_.messages.mkString(", ")).mkString(". ")
            val serverError = s"Problem with quiz form request: $errorMessages"
            log.error(serverError)
            Future.successful(InternalServerError(serverError))
          },
          success = form => renderQuiz(quizId, path, form),
        )
    }

  private def renderQuiz(quizId: String, path: String, answers: form.Inputs)(implicit
      request: RequestHeader,
  ): Future[Result] = {
    val edition = Edition(request)

    log.info(s"Fetching quiz atom: $quizId from content id: $path")
    val capiQuery = contentApiClient.item(path, edition).showAtoms("all")
    val result = contentApiClient.getResponse(capiQuery) map { itemResponse =>
      val maybePage: Option[QuizAnswersPage] = itemResponse.content.flatMap { content =>
        val quiz = Atoms.make(content).flatMap(_.quizzes.find(_.id == quizId))
        quiz.map(QuizAnswersPage(answers, s"${Configuration.site.host}/$path", _))
      }

      maybePage.toLeft(NotFound)
    }
    result recover convertApiExceptions map {
      case Left(page)   => Ok(ContentHtmlPage.html(page))
      case Right(other) => RenderOtherStatus(other)
    }
  }

}
