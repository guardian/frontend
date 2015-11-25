package controllers


import common._
import containers.Containers
import model._
import play.api.mvc.{ RequestHeader, Controller }
import services._
import performance.MemcachedAction
import scala.concurrent.duration._

object RelatedController extends Controller with Related with Containers with Logging with ExecutionContexts {

  private val page = new Page(
    "related-content",
    "related-content",
    "Related content",
    "GFE:Related content"
  )

  def renderHtml(path: String) = render(path)
  def render(path: String) = MemcachedAction { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    related(edition, path, excludeTags) map {
      case Nil => JsonNotFound()
      case trails => renderRelated(trails.sortBy(-_.webPublicationDate.getMillis))
    }
  }

  private def renderRelated(trails: Seq[Content])(implicit request: RequestHeader) = Cached(30.minutes) {
    val relatedTrails = trails map FaciaContentConvert.frontendContentToFaciaContent take 8

    if (request.isJson) {
      val html = views.html.fragments.containers.facia_cards.container(
        onwardContainer("related content", relatedTrails),
        FrontProperties.empty
      )(request)
      JsonComponent("html" -> html)
    } else {
      Ok(views.html.relatedContent(page, relatedTrails))
    }
  }
}
