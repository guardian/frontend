package controllers

import common._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services.Concierge

object RelatedController extends Controller with Logging with ExecutionContexts {

  def render(path: String) = Action { implicit request =>
    val edition = Edition(request)
    val related = Concierge.related(edition, path)

    Async {
      related map {
        case Nil => JsonNotFound()
        case trails => renderRelated(trails)
      }
    }
  }

  private def renderRelated(trails: Seq[Trail])(implicit request: RequestHeader) = Cached(900) {
    val html = views.html.fragments.relatedTrails(trails, "Related content", 5)

    if (request.isJson)
      JsonComponent(
        "html" -> html,
        "trails" -> trails.map(_.url)
      )
    else
      Ok(html)
  }
}

