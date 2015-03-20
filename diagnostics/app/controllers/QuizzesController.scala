package controllers

import java.net.URLEncoder

import common._
import model.diagnostics.abtests.AbTests
import model.diagnostics.analytics.Analytics
import model.diagnostics.css.Css
import model.diagnostics.javascript.JavaScript
import model.diagnostics.quizzes.Quizzes
import model.{NoCache, TinyResponse}
import play.api.mvc.{Content => _, _}

import scala.concurrent.ExecutionContext.Implicits

object QuizzesController extends Controller with Logging {

  implicit val ec = Implicits.global

  def results(quizId: String) = Action.async { implicit request =>
    Quizzes.results(quizId).map {
      json =>
        NoCache(Ok(json))
    }
  }

  def update() = Action.async(parse.text) { implicit request =>
    Quizzes.update(request.body).map {
      _ =>
        NoCache(Ok(""))
    }
  }

}
