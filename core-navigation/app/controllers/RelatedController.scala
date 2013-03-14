package controllers

import com.gu.openplatform.contentapi.model.ItemResponse
import common._
import conf._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import play.api.libs.concurrent.Execution.Implicits._
import concurrent.Future

case class Related(heading: String, trails: Seq[Trail])

object RelatedController extends Controller with Logging {

  def render(path: String) = Action { implicit request =>
    val edition = Site(request).edition
    val promiseOfRelated = Future(lookup(edition, path))
    Async {
      promiseOfRelated.map(_.map {
        case Related(_, Nil) => NotFound
        case r => renderRelated(r)
      } getOrElse { NotFound })
    }
  }

  private def lookup(edition: String, path: String)(implicit request: RequestHeader): Option[Related] = suppressApi404 {
    log.info(s"Fetching related content for : $path for edition $edition")
    val response: ItemResponse = ContentApi.item(path, edition)
      .tag(None)
      .showRelated(true)
      .response

    val heading = "Related content"
    val related = SupportedContentFilter(response.relatedContent map { new Content(_) })

    Some(Related(heading, related))
  }

  private def renderRelated(model: Related)(implicit request: RequestHeader) = {
    Cached(900)(JsonComponent(views.html.fragments.relatedTrails(model.trails, model.heading, 5)))
  }
}
