package controllers

import common._
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import model.{Content, GenericContent}
import model.content.QuizForm
import play.api.mvc.{Result, RequestHeader, Action, Controller}

import scala.concurrent.Future

case class QuizAnswersPage(atom: GenericContent) extends model.ContentPage {
  override val item = atom
}

object QuizController extends Controller with ExecutionContexts with Logging {

  def submit(id: String) = Action.async { implicit request =>

      QuizForm.form.bindFromRequest.fold(
        errors => Future.successful(InternalServerError("error")),
        form => renderAnswersPage(id, form)
      )

  }

  private def renderAnswersPage(quiz: String, answers: QuizForm.UserAnswers)(implicit request: RequestHeader): Future[Result] = {
    val edition = Edition(request)

    log.info(s"Fetching quiz atom: $quiz for edition ${edition.id}: ${RequestLog(request)}")
    val capiItem = LiveContentApi.item(s"atom/quiz/$quiz", edition).showAtoms("all")
    getResponse(capiItem) map { itemResponse =>
      //Ok(views.html.quizAnswerPage())
      Ok("OK")
    }
  }
}
