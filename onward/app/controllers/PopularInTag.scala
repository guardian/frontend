package controllers

import common._
import containers.Containers
import contentapi.ContentApiClient
import feed.MostReadAgent
import model._
import play.api.mvc.{Action, Controller, RequestHeader}
import services._

class PopularInTag(val contentApiClient: ContentApiClient, val mostReadAgent: MostReadAgent)(implicit context: ApplicationContext) extends Controller with Related with Containers with Logging with ExecutionContexts {
  def render(tag: String) = Action.async { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    getPopularInTag(edition, tag, excludeTags) map {
      case popular if popular.items.isEmpty => Cached(60)(JsonNotFound())
      case trails => renderPopularInTag(trails)
    }
  }

  private def renderPopularInTag(trails: RelatedContent)(implicit request: RequestHeader) = Cached(600) {
    // Initially a fix for PaidFor related content (where this problem is more common), the decision to truncate is due
    // to aesthetic issues with the second slice when there are only 5 or 6 results in related content (7 looks fine).
    val numberOfCards = if (trails.faciaItems.length == 5 || trails.faciaItems.length == 6) 4 else 8
    val html = views.html.fragments.containers.facia_cards.container(
      onwardContainer("related content", trails.faciaItems take numberOfCards),
      FrontProperties.empty
    )

    JsonComponent(html)
  }
}
