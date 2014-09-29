package controllers

import com.gu.crosswords.api.client.models.Type
import play.api.mvc.{Action, Controller}
import crosswords.maybeApi

import scala.concurrent.Future

object CrosswordsController extends Controller {
  def crossword(crosswordType: String, id: String) = Action.async { request =>
    maybeApi match {
      case Some(apiClient) =>
        apiClient.getCrossword(Type.fromString())

      case None =>
        Future.successful(InternalServerError("Crossword API credentials not set up."))
    }
  }
}
