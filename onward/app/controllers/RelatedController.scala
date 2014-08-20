package controllers

import common._
import model._
import play.api.mvc.{ RequestHeader, Controller }
import services._
import performance.MemcachedAction
import scala.concurrent.duration._

object RelatedController extends Controller with Related with Logging with ExecutionContexts {

  def renderHtml(path: String) = render(path)
  def render(path: String) = MemcachedAction { implicit request =>
    val edition = Edition(request)
    related(edition, path) map {
      case Nil => JsonNotFound()
      case trails => renderRelated(trails.sortBy(-_.webPublicationDate.getMillis))
    }
  }

  private def renderRelated(trails: Seq[Trail])(implicit request: RequestHeader) = Cached(30.minutes) {
    val html = views.html.fragments.relatedTrails(trails, "Related content", 5)

    if (request.isJson) {
      JsonComponent("html" -> html)
    } else {
      Ok(html)
    }
  }
}
