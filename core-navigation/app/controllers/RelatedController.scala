package controllers

import common._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services._

object RelatedController extends Controller with Related with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(path: String) = Action.async { implicit request =>
    val edition = Edition(request)
    related(edition, path) map {
      case Nil => JsonNotFound()
      case trails => renderRelated(trails)
    }
  }

  private def renderRelated(trails: Seq[Trail])(implicit request: RequestHeader) = Cached(900) {
    val html = views.html.fragments.relatedTrails(trails, "Related content", 5)

    if (request.isJson)
      JsonComponent(
        "html" -> html,
        "trails" -> trails.map(_.shortUrlId)
      )
    else
      Ok(html)
  }
}
