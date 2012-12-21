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
      .showEditorsPicks(true)
      .response

    val editorsPicks = response.editorsPicks map { new Content(_) }

    val pageSize = extractPageSize(request).getOrElse(editorsPicks.size)

    editorsPicks take pageSize match {
      case Nil => None
      case picks => Some(picks)
    }

  }

  private def renderTopStories(trails: Seq[Trail], format: String)(implicit request: RequestHeader) = {

    checkFormat(format).map { validFormat =>
      Cached(900) {
        if (validFormat == "json") {
          // pull out the paging params
          val paging = extractPaging(request)
          val offsetTrails: Seq[Trail] = trails.drop(paging("actual-offset"))
          if (offsetTrails.size == 0) {
            NoContent
          } else {
            // option to use 'section' view
            val html: Html = if (request.getQueryString("view").getOrElse("") == "section") {
              views.html.fragments.trailblocks.section(
                offsetTrails.take(paging("page-size")), numWithImages = 0, showFeatured = false
              )
            } else {
              views.html.fragments.topStories(offsetTrails.take(paging("page-size")))
            }
            JsonComponent(
              request.getQueryString("callback"),
              "html" -> html,
              "hasMore" -> (offsetTrails.size > paging("page-size"))
            )
          }
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