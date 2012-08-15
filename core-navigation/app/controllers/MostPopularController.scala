package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }

object MostPopularController extends Controller with Logging {

  def render(edition: String, path: String) = Action { implicit request =>

    val globalPopular = lookup(edition, "/").toList

    val sectionPopular = if (path != "/") lookup(edition, path).toList else Nil

    (sectionPopular ++ globalPopular) match {
      case Nil => NotFound
      case popular => renderMostPopular(popular)
    }
  }

  def renderGlobal(edition: String) = render(edition, "/")

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[MostPopular] = suppressApi404 {
    log.info("Fetching most popular: " + path + " for edition " + edition)

    val response: ItemResponse = ContentApi.item(path, edition)
      .showMostViewed(true)
      .response

    val heading = response.section.map(s => s.webTitle).getOrElse("guardian.co.uk")
    val popular = response.mostViewed map { new Content(_) } take (10)

    if (popular.size == 0) None else Some(MostPopular(heading, popular))
  }

  private def renderMostPopular(popular: Seq[MostPopular])(implicit request: RequestHeader) =
    Cached(900)(JsonComponent(views.html.fragments.mostPopular(popular, 5)))

}