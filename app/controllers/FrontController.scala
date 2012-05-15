package controllers

import conf._
import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import play.api.mvc.{ Controller, Action }

case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], latestContent: Seq[Trail])

object FrontController extends Controller with Logging {
  def render(path: String) = Action {
    lookup(path) map { renderFront(_) } getOrElse { NotFound }
  }

  private def lookup(path: String): Option[SectionFrontPage] = suppressApi404 {
    log.info("Fetching front: " + path)
    val response: ItemResponse = ContentApi.item
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

  private def renderFront(model: SectionFrontPage) = Ok(views.html.front(model.section, model.editorsPicks, model.latestContent))
}