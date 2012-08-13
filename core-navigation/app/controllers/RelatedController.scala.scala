package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

case class Related(heading: String, trails: Seq[Trail])

object RelatedController extends Controller with Logging {

  def render(edition: String, path: String) = Action {
    implicit request =>
      lookup(edition, path) map {
        renderRelated
      } getOrElse {
        NotFound
      }
  }

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[Related] = suppressApi404 {
    log.info("Fetching related content for : " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showRelated(true)
      .response

    val heading = "Related content"
    val related = response.relatedContent map { new Content(_) }

    Some(Related(heading, related))
  }

  private def renderRelated(model: Related)(implicit request: RequestHeader) =
    Cached(900)(JsonComponent(views.html.fragments.relatedTrails(model.trails, model.heading, 5)))
}
