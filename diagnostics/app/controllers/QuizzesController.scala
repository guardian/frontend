package controllers

import common._
import model.{TinyResponse, Cors}
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits

// Deprecated service, we won't support quiz results soon.
class QuizzesController extends Controller with Logging {

  implicit val ec = Implicits.global

  def results(quizId: String) = Action { implicit request => Cors(NotFound("")) }

  def update() = Action { implicit request => Cors(NotFound("")) }

  def resultsOptions(id: String) = Action { implicit request =>
    TinyResponse.noContent(Some("GET, OPTIONS"))
  }

  def updateOptions = Action { implicit request =>
    TinyResponse.noContent(Some("POST, OPTIONS"))
  }

}
