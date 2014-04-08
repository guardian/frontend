package controllers

import common._
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services._

object PopularInTag extends Controller with Related with Logging with ExecutionContexts {

  def renderJson(path: String) = render(path)
  def render(tag: String) = Action.async { implicit request =>
    val edition = Edition(request)
    getPopularInTag(edition, tag) map {
      case Nil => JsonNotFound()
      case trails => renderPopularInTag(trails)
    }
  }

  private def renderPopularInTag(trails: Seq[Trail])(implicit request: RequestHeader) = Cached(600) {

    val html = views.html.fragments.relatedTrails(trails, "Related content", 10)

    if (request.isJson)
      JsonComponent(
        "html" -> html
      )
    else
      Ok(html)
  }
}