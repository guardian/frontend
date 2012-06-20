package controllers

import common._
import conf._
import model._
import play.api.mvc.{ Result, RequestHeader, Controller, Action }

case class FrontPage(front: Front)

object FrontController extends Controller with Logging {
  def render() = Action { implicit request =>
    lookup() map { renderFront } getOrElse { NotFound }
  }

  private def lookup()(implicit request: RequestHeader): Option[FrontPage] = {
    val edition = Edition(request, Configuration)
    Some(FrontPage(Front(edition)))
  }

  private def renderFront(model: FrontPage)(implicit request: RequestHeader): Result =
    CachedOk(model.front) {
      Compressed(views.html.front(model.front))
    }
}
