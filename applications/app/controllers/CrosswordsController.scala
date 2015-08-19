package controllers

import com.gu.contentapi.client.model.{Content => ApiContent, Crossword}
import common.{Edition, ExecutionContexts}
import conf.{Configuration, LiveContentApi, Static}
import crosswords._
import model.{ApiContentWithMeta, Cached, Cors}
import play.api.mvc.{Action, Controller, RequestHeader, Result, _}
import scala.concurrent.duration._
import scala.concurrent.Future

object CrosswordsController extends Controller with ExecutionContexts {
  protected def withCrossword(crosswordType: String, id: Int)(f: (Crossword, ApiContent) => Result)(implicit request: RequestHeader): Future[Result] = {
    LiveContentApi.getResponse(LiveContentApi.item(s"crosswords/$crosswordType/$id", Edition(request)).showFields("all")).map { response =>
       val maybeCrossword = for {
        content <- response.content
        crossword <- content.crossword }
       yield f(crossword, content)
       maybeCrossword getOrElse InternalServerError("Crossword response from Content API invalid.")
    } recover { case _ => InternalServerError("Content API query returned an error.") }
  }

  def crossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(Ok(views.html.crossword(
        new CrosswordPage(CrosswordData.fromCrossword(crossword), ApiContentWithMeta(content)),
         CrosswordSvg(crossword, None, None, false)
      )))
    }
  }

  def accessibleCrossword(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, content) =>
      Cached(60)(Ok(views.html.accessibleCrossword(
        new CrosswordPage(CrosswordData.fromCrossword(crossword), ApiContentWithMeta(content)),
        AccessibleCrosswordRows(crossword)
      )))
    }
  }

  def thumbnail(crosswordType: String, id: Int) = Action.async { implicit request =>
    withCrossword(crosswordType, id) { (crossword, _) =>
      val xml = CrosswordSvg(crossword, Some("100%"), Some("100%"), trim = true)

      val globalStylesheet = Static("stylesheets/content.css")

      Cached(60) {
        Cors {
          Ok( s"""<?xml-stylesheet type="text/css" href="$globalStylesheet" ?>$xml""").as("image/svg+xml")
        }
      }
    }
  }
}

object CrosswordPreferencesController extends Controller with PreferenceController {
  private val CrosswordOptIn = "crossword_opt_in"
  private val CrosswordOptInPath= "/crosswords"
  private val CrosswordOptInMaxAge = 14.days.toSeconds.toInt
  private val CrosswordOptOutMaxAge = 60.days.toSeconds.toInt

  def crosswordsOptIn = Action { implicit request =>
    Cached(60)(SeeOther("/crosswords?view=beta").withCookies(
      Cookie(
        CrosswordOptIn, "true",
        path = CrosswordOptInPath,
        maxAge = Some(CrosswordOptInMaxAge),
        domain = getShortenedDomain(request.domain)
      )
    ))
  }

  def crosswordsOptOut = Action { implicit request =>
    Cached(60)(SeeOther("/crosswords?view=classic").withCookies(
      Cookie(
        CrosswordOptIn, "false",
        path = CrosswordOptInPath,
        maxAge = Some(CrosswordOptOutMaxAge),
        domain = getShortenedDomain(request.domain)
      )
    ))
  }
}