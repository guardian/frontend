package controllers

import conf._
import common._
import play.api.mvc.{ Controller, Action }
import com.gu.openplatform.contentapi.model.{ Section, ItemResponse }

case class SectionFrontTrails(sectionTitle: String, editorsPicks: Seq[Trail], mostViewed: Seq[Trail])

object FrontController extends Controller with Logging {
  def render(path: String) = Action {
    lookup(path) map { renderFront(_) } getOrElse { NotFound }
  }

  private def lookup(path: String): Option[SectionFrontTrails] = suppressApi404 {
    log.info("Fetching front for " + path)
    val query: ContentApi.ItemQuery = ContentApi.item
      .showTags("all")
      .showFields("all")
      .showMedia("all")
      .showEditorsPicks(true)
      .showMostViewed(true)
      .itemId(path)

    log.info(query._apiUrl.get + (query.parameters.map { case (key, value) => key + "=" + value }).mkString("?", "&", ""))

    val response: ItemResponse = query response

    val sectionTitle = response.section match {
      case Some(section: Section) => section.webTitle
      case None => "Front for " + path
    }
    val editorsPicks = response.editorsPicks map { new Content(_) }
    val mostViewed = response.mostViewed map { new Content(_) }

    Some(SectionFrontTrails(sectionTitle, editorsPicks, mostViewed))
  }

  private def renderFront(model: SectionFrontTrails) = Ok(views.html.front(model.sectionTitle, model.editorsPicks, model.mostViewed))
}