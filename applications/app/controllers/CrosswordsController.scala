package controllers

import com.gu.crosswords.api.client.models.Type
import common.ExecutionContexts
import play.api.mvc.{Action, Controller}
import crosswords.{CrosswordData, CrosswordPage, maybeApi}
import scala.concurrent.Future
import scala.util.Try

object CrosswordsController extends Controller with ExecutionContexts {
  def crossword(crosswordTypeString: String, idString: String) = Action.async { implicit request =>
    maybeApi match {
      case Some(apiClient) =>
        (Type.fromString(crosswordTypeString), Try(idString.toInt).toOption) match {
          case (Some(crosswordType), Some(id)) =>
            apiClient.getCrossword(crosswordType, id) map { crossword =>
              Ok(views.html.crossword(new CrosswordPage(CrosswordData.fromCrossword(crossword))))
            }

          case (None, _) =>
            Future.successful(NotFound(s"$crosswordTypeString is not a valid crossword type"))

          case (_, None) =>
            Future.successful(NotFound(s"$idString is not a number"))
        }

      case None =>
        Future.successful(InternalServerError("Crossword API credentials not set up."))
    }
  }
}
