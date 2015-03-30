package controllers

import com.gu.crosswords.api.client.models.{Crossword, Type => CrosswordType}
import common.ExecutionContexts
import conf.Static
import model.Cached
import play.api.mvc.{Result, Action, Controller}
import crosswords._

import scala.concurrent.Future
import scala.concurrent.duration._

object CrosswordsController extends Controller with ExecutionContexts {
  protected def withCrossword(crosswordType: CrosswordType, id: Int)(f: Crossword => Result): Future[Result] = {
    maybeApi match {
      case Some(apiClient) =>
        apiClient.getCrossword(crosswordType, id).map(f)

      case None =>
        Future.successful(InternalServerError("Crossword API credentials not set up."))
    }
  }

  def crossword(crosswordType: CrosswordType, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { crossword =>
      Cached(60)(Ok(views.html.crossword(
        new CrosswordPage(CrosswordData.fromCrossword(crossword)),
        CrosswordSvg(crossword, None, None, false)
      )))
    }
  }

  def thumbnail(crosswordType: CrosswordType, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { crossword =>
      val xml = CrosswordSvg(crossword, Some("100%"), Some("100%"), trim = true)

      val globalStylesheet = Static("stylesheets/global.css")

      Cached(60)(Ok(s"""<?xml-stylesheet type="text/css" href="$globalStylesheet" ?>$xml""").as("image/svg+xml"))
    }
  }
}
