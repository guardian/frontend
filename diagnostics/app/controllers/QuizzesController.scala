package controllers

import common._
import conf.Switches
import model.diagnostics.quizzes.Quizzes
import model.{TinyResponse, Cached, NoCache}
import play.api.mvc.{Content => _, _}

import scala.concurrent.ExecutionContext.Implicits
import scala.concurrent.Future

object QuizzesController extends Controller with Logging {

  implicit val ec = Implicits.global

  def results(quizId: String) = Action.async { implicit request =>
    if (Switches.QuizScoresService.isSwitchedOn) {
      Quizzes.results(quizId).map {
        json =>
          Cached(600)(Ok(json))
      }
    } else {
      Future.successful(Cached(3600)(NotFound("")))
    }
  }

  def update() = Action.async(parse.json) { implicit request =>
    if (Switches.QuizScoresService.isSwitchedOn) {
      Quizzes.update(request.body).map {
        _ =>
          NoCache(Ok(""))
      }
    } else {
      Future.successful(Cached(3600)(NotFound("")))
    }
  }

  def acceptBeaconOptions = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }

}
