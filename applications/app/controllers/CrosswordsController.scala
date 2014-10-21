package controllers

import com.gu.crosswords.api.client.models.{Crossword, Type}
import common.ExecutionContexts
import play.api.mvc.{Result, Action, Controller}
import crosswords.{CrosswordSvg, CrosswordData, CrosswordPage, maybeApi}
import scala.concurrent.Future
import scala.util.{Success, Try}

object CrosswordsController extends Controller with ExecutionContexts {
  protected def withCrossword(crosswordTypeString: String, idString: String)(f: Crossword => Result): Future[Result] = {
    maybeApi match {
      case Some(apiClient) =>
        (Type.fromString(crosswordTypeString), Try(idString.toInt).toOption) match {
          case (Some(crosswordType), Some(id)) =>
            apiClient.getCrossword(crosswordType, id).map(f)

          case (None, _) =>
            Future.successful(NotFound(s"$crosswordTypeString is not a valid crossword type"))

          case (_, None) =>
            Future.successful(NotFound(s"$idString is not a number"))
        }

      case None =>
        Future.successful(InternalServerError("Crossword API credentials not set up."))
    }
  }

  def crossword(crosswordTypeString: String, idString: String) = Action.async { implicit request =>
    withCrossword(crosswordTypeString, idString) { crossword =>
      Ok(views.html.crossword(new CrosswordPage(CrosswordData.fromCrossword(crossword))))
    }
  }

  def thumbnail(crosswordTypeString: String, idString: String, widthString: String, heightString: String) = Action.async { implicit request =>
    Try {
      (widthString.toInt, heightString.toInt)
    } match {
      case Success((width, height)) => withCrossword(crosswordTypeString, idString) { crossword =>
        Ok(CrosswordSvg.apply(crossword, width, height)).as("image/svg+xml")
      }

      case _ => Future.successful(BadRequest("width and height must both be integers"))
    }
  }
}
