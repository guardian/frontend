package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

case class Related(heading: String, trails: Seq[Trail])

object LatestFromSectionController extends Controller with Logging {

  def render(edition: String, sectionId: String) = Action {
    implicit request =>
      lookup(edition, sectionId) map { renderLatest } getOrElse { NotFound }
  }

  def renderGlobal(edition: String) = render(edition, "/")

  private def lookup(edition: String, sectionId: String)(implicit request: RequestHeader): Option[Seq[Trail]] = suppressApi404 {
    log.info("Fetching latest content for : " + sectionId + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(sectionId, edition)
      .showEditorsPicks(true)
      .response

    val latest = response.results map { new Content(_) }
    val editorsPicks = response.editorsPicks map { new Content(_) }
    val editorsPicksIds = editorsPicks.map(_.id)
    (editorsPicks ++ (latest.filterNot(c => editorsPicksIds.contains(c.id)))) take 10 match {
      case Nil => None
      case trails => Some(trails)
    }
  }

  private def renderLatest(trails: Seq[Trail])(implicit request: RequestHeader) =
    Cached(900)(JsonComponent(views.html.fragments.latest(trails)))
}