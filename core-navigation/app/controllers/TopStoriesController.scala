package controllers

import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Execution.Implicits._
import com.gu.openplatform.contentapi.ApiError

object TopStoriesController extends Controller with Logging with Paging with JsonTrails {

  val validFormats: Seq[String] = Seq("html", "json")

  def render() = Action { implicit request =>
    val edition = Site(request).edition
    val promiseOfTopStories = lookup(edition)
    Async {
      promiseOfTopStories.map(_.map { renderTopStories(_, "html") } getOrElse { NotFound })
    }
  }

  def renderJson() = Action { implicit request =>
    val edition = Site(request).edition
    val promiseOfTopStories = lookup(edition)
    Async {
      promiseOfTopStories.map(_.map { renderTopStories(_, "json") } getOrElse { NotFound })
    }
  }

  private def lookup(edition: String)(implicit request: RequestHeader) = {
    log.info(s"Fetching top stories for edition $edition")
    ContentApi.item("/", edition)
      .showEditorsPicks(true)
      .response
      .map {response =>
        SupportedContentFilter(response.editorsPicks map { new Content(_) }) match {
          case Nil => None
          case picks => Some(picks)
        }
      }.recover{case ApiError(404, message) =>
        log.info(s"Got a 404 while calling content api: $message")
        None
      }
  }

  private def renderTopStories(trails: Seq[Trail], format: String)(implicit request: RequestHeader) = {
    Cached(900) {
      if (format == "json") {
        renderJsonTrails(trails)
      } else {
        val page = new Page(
          Some("http://www.guardian.co.uk/"),
          "top-stories",
          "top-stories",
          "Top Stories",
          "GFE:Top Stories"
        )
        Ok(Compressed(views.html.topStories(page, trails)))
      }
    }
  }
}