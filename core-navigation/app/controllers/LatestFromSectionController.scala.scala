package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

object LatestFromZoneController extends Controller with Logging {

  def render(edition: String, zoneId: String) = Action {
    implicit request =>
      lookup(edition, zoneId) map { renderLatest } getOrElse { NotFound }
  }

  private def lookup(edition: String, zoneId: String)(implicit request: RequestHeader) = suppressApi404 {
    log.info("Fetching latest content for : " + zoneId + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(zoneId, edition)
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