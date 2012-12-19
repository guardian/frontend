package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.Play.current
import play.api.libs.concurrent.Akka

case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], latestContent: Seq[Trail])

object SectionController extends Controller with Logging {
  def render(path: String) = Action { implicit request =>
    val promiseOfSection = Akka.future(lookup(path))
    Async {
      promiseOfSection.map(_.map { renderSectionFront(_) } getOrElse { NotFound })
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[SectionFrontPage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching front: " + path + "for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showEditorsPicks(true)
      .showMostViewed(true)
      .response

    val section = response.section map { Section(_) }

    val editorsPicks = response.editorsPicks map { new Content(_) }

    val editorsPicksIds = editorsPicks map { _.id }

    val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }

    section map { SectionFrontPage(_, editorsPicks, latestContent) }
  }

  // pull out 'paging' (int) query string params
  private def extractPaging(request: RequestHeader, queryParam: String): Option[Int] = {
    try {
      request.getQueryString(queryParam).map(_.toInt)
    } catch {
      case _: NumberFormatException => None
    }
  }

  private def renderSectionFront(model: SectionFrontPage)(implicit request: RequestHeader) = Cached(model.section) {

    request.getQueryString("callback").map { callback =>
      // pull out page-size, page and offset
      val offset: Int = extractPaging(request, "offset").getOrElse(0)
      val pageSize: Int = extractPaging(request, "page-size").getOrElse(5)
      val page: Int = extractPaging(request, "page").getOrElse(1)
      // limit trails based on paging
      val trails: Seq[Trail] = (model.editorsPicks ++ model.latestContent).drop(offset + (pageSize * (page - 1))).take(pageSize)
      if (trails.size == 0) {
        NoContent
      } else {
        JsonComponent(views.html.fragments.trailblocks.section(trails, numWithImages = 0, showFeatured = false))
      }
    }.getOrElse {
      Ok(Compressed(views.html.section(model.section, model.editorsPicks, model.latestContent)))
    }

  }

}
