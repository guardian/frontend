package controllers

import common._
import containers.Containers
import model._
import play.api.mvc.{ RequestHeader, Controller, Action }
import services._

object PopularInTag extends Controller with Related with Containers with Logging with ExecutionContexts {
  def render(tag: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    getPopularInTag(edition, tag, excludeTags) map {
      case Nil => JsonNotFound()
      case trails => renderPopularInTag(trails)
    }
  }

  private def renderPopularInTag(trails: Seq[Content])(implicit request: RequestHeader) = Cached(600) {
    val html = views.html.fragments.containers.facia_cards.container(
      onwardContainer("related content", trails map FaciaContentConvert.frontendContentToFaciaContent take 8),
      FrontProperties.empty
    )(request)

    JsonComponent(
      "html" -> html
    )
  }
}
