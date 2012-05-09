package controllers

import conf._
import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import play.api.mvc.{ Controller, Action }

case class SectionFrontPage(section: Section, editorsPicks: Seq[Trail], mostViewed: Seq[Trail])

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
    val mostViewed = response.mostViewed map { new Content(_) }

    section map { SectionFrontPage(_, editorsPicks, mostViewed) }
  }

  private def renderFront(model: SectionFrontPage) = Ok(views.html.front(model.section, model.editorsPicks, model.mostViewed))
}