package controllers

import common._
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import model._
import model.content.{QuizSubmissionResult, Quiz, Atoms, QuizForm}
import play.api.mvc.{Result, RequestHeader, Action, Controller}
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class QuizAnswersPage(
  answers: QuizForm.UserAnswers,
  quiz: Quiz) extends model.StandalonePage {
  override val metadata = MetaData.make("quiz atom", "quizzes", quiz.title, "GFE: Quizzes")

  val results: QuizSubmissionResult = quiz.submitAnswers(answers)
}

object QuizController extends Controller with ExecutionContexts with Logging {

  def submit(quizId: String, path: String) = Action.async { implicit request =>

      QuizForm.form.bindFromRequest.fold(
        errors => Future.successful(InternalServerError("error")),
        form => renderQuiz(quizId, path, form)
      )

  }

  private def renderQuiz(quizId: String, path: String, answers: QuizForm.UserAnswers)(implicit request: RequestHeader): Future[Result] = {
    val edition = Edition(request)

    log.info(s"Fetching quiz atom: $quizId from content id: $path: ${RequestLog(request)}")
    val capiQuery = LiveContentApi.item(path, edition).showAtoms("all")
    val result = getResponse(capiQuery) map { itemResponse =>
      val maybePage: Option[QuizAnswersPage] = itemResponse.content.flatMap { content =>

        val quiz = Atoms.make(content).flatMap(_.quizzes.find(_.id == quizId))
        quiz.map(QuizAnswersPage(answers, _))
      }

      maybePage.toLeft(NotFound)
    }
    result recover convertApiExceptions map {
      case Left(page) => Ok(views.html.quizAnswerPage(page))
      case Right(other) => RenderOtherStatus(other)
    }
  }

}
