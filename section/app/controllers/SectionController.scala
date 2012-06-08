package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import play.api.mvc.{ RequestHeader, Controller, Action }

case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], latestContent: Seq[Trail])

object SectionController extends Controller with Logging {
  def render(path: String) = Action { implicit request =>
    lookup(path) map { renderSectionFront(_) } getOrElse { NotFound }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Option[SectionFrontPage] = suppressApi404 {
    val edition = Edition(request, Configuration)
    log.info("Fetching front: " + path + "for edition " + edition)
    val response: ItemResponse = ContentApi.item
      .edition(edition)
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showEditorsPicks(true)
      .showMostViewed(true)
      .itemId(path)
      .response

    val section = response.section map { Section(_) }

    val editorsPicks = response.editorsPicks map { new Content(_) }

    val editorsPicksIds = editorsPicks map { _.id }

    val latestContent = response.results map { new Content(_) } filterNot { c => editorsPicksIds contains (c.id) }

    section map { SectionFrontPage(_, editorsPicks, latestContent) }
  }

  private def renderSectionFront(model: SectionFrontPage)(implicit request: RequestHeader) =
    CachedOk(model.section) {
      views.html.section(model.section, model.editorsPicks, model.latestContent)
    }
}