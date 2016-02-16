package controllers

import common._
import conf.{Configuration, LiveContentApi}
import conf.LiveContentApi.getResponse
import model._
import model.content.{Quiz, Atoms}
import quiz.form
import play.api.mvc.{Result, RequestHeader, Action, Controller}
import views.support.RenderOtherStatus

import scala.concurrent.Future

case class QuizAnswersPage(
  inputs: form.Inputs,
  contentPage: String,
  quiz: Quiz) extends model.StandalonePage {
  override val metadata = MetaData.make("quiz atom", "quizzes", quiz.title, "GFE: Quizzes")

  val results: form.QuizResults = form.checkUsersAnswers(inputs, quiz)
  val shares: Seq[ShareLink] = ShareLinks.createShareLinks(form.shares, href = contentPage, title = quiz.title, mediaPath = None)
}

object QuizController extends Controller with ExecutionContexts with Logging {

  def submit(quizId: String, path: String) = Action.async { implicit request =>
    form.playForm.bindFromRequest.fold(
      hasErrors = errors => Future.successful(InternalServerError("error")),
      success = form => renderQuiz(quizId, path, form)
    )
  }

  private def renderQuiz(quizId: String, path: String, answers: form.Inputs)(implicit request: RequestHeader): Future[Result] = {
    val edition = Edition(request)

    log.info(s"Fetching quiz atom: $quizId from content id: $path: ${RequestLog(request)}")
    val capiQuery = LiveContentApi.item(path, edition).showAtoms("all")
    val result = getResponse(capiQuery) map { itemResponse =>
      val maybePage: Option[QuizAnswersPage] = itemResponse.content.flatMap { content =>

        val quiz = Atoms.make(content).flatMap(_.quizzes.find(_.id == quizId))
        quiz.map(QuizAnswersPage(answers, s"${Configuration.site.host}/$path", _))
      }

      maybePage.toLeft(NotFound)
    }
    result recover convertApiExceptions map {
      case Left(page) => Ok(views.html.quizAnswerPage(page))
      case Right(other) => RenderOtherStatus(other)
    }
  }

}
