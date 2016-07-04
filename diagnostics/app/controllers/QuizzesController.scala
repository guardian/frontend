package controllers

import common._
import model.Cached.WithoutRevalidationResult
import model.{TinyResponse, Cached}
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits
import scala.concurrent.Future

// Deprecated service, we won't support quiz results soon.
class QuizzesController extends Controller with Logging {

  implicit val ec = Implicits.global

  def results(quizId: String) = Action.async { implicit request =>
    Future.successful(Cached(3600)(WithoutRevalidationResult(NotFound(""))))
  }

  def update() = Action.async(parse.json) { implicit request =>
    Future.successful(Cached(3600)(WithoutRevalidationResult(NotFound(""))))
  }

  def resultsOptions(id: String) = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }

  def updateOptions = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }

}
