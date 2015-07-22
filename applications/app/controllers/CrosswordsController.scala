package controllers

import com.gu.contentapi.client.model.Crossword
import conf.LiveContentApi
import common.{Edition, ExecutionContexts}
import conf.Static
import model.Cached
import play.api.mvc.{Result, Action, Controller, RequestHeader}
import crosswords._

import scala.concurrent.Future
import scala.concurrent.duration._

object CrosswordsController extends Controller with ExecutionContexts {
  protected def withCrossword(crosswordType: String, id: Int)(f: Crossword => Result)(implicit request: RequestHeader): Future[Result] = {
    LiveContentApi.getResponse(LiveContentApi.item(s"crosswords/$crosswordType/$id", Edition(request))).map { response =>
       val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword }
       yield f(crossword)
       maybeCrossword getOrElse InternalServerError("Crossword response from Content API invalid.")
    } recover { case _ => InternalServerError("Content API query returned an error.") }
  }

  def crossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { crossword =>
      Cached(60)(Ok(views.html.crossword(
        new CrosswordPage(CrosswordData.fromCrossword(crossword)),
        CrosswordSvg(crossword, None, None, false)
      )))
    }
  }

  def thumbnail(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { crossword =>
      val xml = CrosswordSvg(crossword, Some("100%"), Some("100%"), trim = true)

      val globalStylesheet = Static("stylesheets/content.css")

      Cached(60)(Ok(s"""<?xml-stylesheet type="text/css" href="$globalStylesheet" ?>$xml""").as("image/svg+xml"))
    }
  }
}
