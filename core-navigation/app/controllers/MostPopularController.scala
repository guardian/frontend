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

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[MostPopular] = suppressApi404 {
    log.info("Fetching most popular: " + path + " for edition " + edition)
    val response: ItemResponse = ContentApi.item
      .showMostViewed(true)
      .edition(edition)
      .showTags("all")
      .showFields("trail-text,liveBloggingNow")
      .showMedia("all")
      .itemId(path)
      .response

    val heading = response.section.map(s => "Popular on " + s.webTitle).getOrElse("Popular right now")

    Some(MostPopular(heading, response.mostViewed map { new Content(_) }))
  }

  private def renderMostPopular(model: MostPopular)(implicit request: RequestHeader) =
    Cached(900)(Json(views.html.fragments.relatedTrails(model.trails, model.heading, 5)))

}