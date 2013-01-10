package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.Play.current
import play.api.libs.concurrent.Akka
import play.api.templates.Html

object TopStoriesController extends Controller with Logging with Paging with Formats {

  val validFormats: Seq[String] = Seq("html", "json")

  def render(format: String) = Action { implicit request =>
    val edition = Edition(request, Configuration)
    val promiseOfTopStories = Akka.future(lookup(edition))
    Async {
      promiseOfTopStories.map(_.map { renderTopStories(_, format) } getOrElse { NotFound })
    }
  }

  private def lookup(edition: String)(implicit request: RequestHeader) = suppressApi404 {
    log.info("Fetching top stories for edition " + edition)
    val response: ItemResponse = ContentApi.item("/", edition)
      .showEditorsPicks(true)
      .response

    SupportedContentFilter(response.editorsPicks map { new Content(_) }) match {
      case Nil => None
      case picks => Some(picks)
    }

  }

  private def renderTopStories(trails: Seq[Trail], format: String)(implicit request: RequestHeader) = {

    checkFormat(format).map { validFormat =>
      Cached(900) {
        if (validFormat == "json") {
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
    } getOrElse (BadRequest)

  }

}