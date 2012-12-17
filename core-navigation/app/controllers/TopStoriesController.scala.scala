package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.Play.current
import play.api.libs.concurrent.Akka

object TopStoriesController extends Controller with Logging {

  def render(edition: String) = Action { implicit request =>
    val promiseOfTopStories = Akka.future(lookup(edition))
    Async {
      promiseOfTopStories.map(_.map { renderTopStories(_) } getOrElse { NotFound })
    }
  }

  private def lookup(edition: String)(implicit request: RequestHeader) = suppressApi404 {
    log.info("Fetching top stories for edition " + edition)
    val response: ItemResponse = ContentApi.item("/", edition)
      .showEditorsPicks(true)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }

    editorsPicks take 10 match {
      case Nil => None
      case picks => Some(picks)
    }

  }

  private def renderTopStories(trails: Seq[Trail])(implicit request: RequestHeader) =

    Cached(900) {
      request.getQueryString("callback").map { callback =>
        JsonComponent(views.html.fragments.topStories(trails))
      }.getOrElse {
        val page = new Page(
          Some("http://www.guardian.co.uk/"),
          "",
          "top-stories",
          "Top Stories",
          "GFE:Top Stories"
        )
        Ok(Compressed(views.html.topStories(page, trails)))
      }
    }

}