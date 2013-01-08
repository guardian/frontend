package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.Play.current
import play.api.libs.concurrent.Akka

object TopStoriesController extends Controller with Logging {

  def render() = Action { implicit request =>
    val edition = Edition(request, Configuration)
    val promiseOfTopStories = Akka.future(lookup(edition))
    Async {
      promiseOfTopStories.map(_.map { renderTopStories } getOrElse { NotFound })
    }
  }

  // pull out `page-size` query string parameter
  private def extractPageSize(request: RequestHeader): Option[Int] = {
    try {
      request.getQueryString("page-size").map(_.toInt)
    } catch {
      case _: NumberFormatException => None
    }
  }

  private def lookup(edition: String)(implicit request: RequestHeader) = suppressApi404 {
    log.info("Fetching top stories for edition " + edition)
    val response: ItemResponse = ContentApi.item("/", edition)
      .tag(None)
      .showEditorsPicks(true)
      .response

    val editorsPicks = SupportedContentFilter(response.editorsPicks map { new Content(_) })

    val pageSize = extractPageSize(request).getOrElse(editorsPicks.size)

    editorsPicks take pageSize match {
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
          "top-stories",
          "top-stories",
          "Top Stories",
          "GFE:Top Stories"
        )
        Ok(Compressed(views.html.topStories(page, trails)))
      }
    }

}