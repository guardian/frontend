package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

case class MostPopular(heading: String, trails: Seq[Trail])

object MostPopularController extends Controller with Logging {

  def render(edition: String, path: String) = Action { implicit request =>
    lookup(edition, path) map { renderMostPopular } getOrElse { NotFound }
  }

  def renderGlobal(edition: String) = render(edition, "/")

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[MostPopular] = suppressApi404 {
    log.info("Fetching most popular: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item(path, edition)
      .showMostViewed(true)
      .response

    val heading = response.section.map(s => "Popular on " + s.webTitle).getOrElse("Popular right now")
    val popular = response.mostViewed map { new Content(_) }

    Some(MostPopular(heading, popular))
  }

  private def renderMostPopular(model: MostPopular)(implicit request: RequestHeader) =
    Cached(900)(JsonComponent(views.html.fragments.relatedTrails(model.trails, model.heading, 5)))

}