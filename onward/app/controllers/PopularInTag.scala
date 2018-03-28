package controllers

import java.net.URI

import common._
import containers.Containers
import contentapi.ContentApiClient
import feed.MostReadAgent
import model._
import play.api.mvc._
import services._

class PopularInTag(
  val contentApiClient: ContentApiClient,
  val mostReadAgent: MostReadAgent,
  val controllerComponents: ControllerComponents
)(implicit context: ApplicationContext)
  extends BaseController with Related with Containers with Logging with ImplicitControllerExecutionContext {

  import implicits.Requests._

  def render(tag: String): Action[AnyContent] = Action.async { implicit request =>
    val edition = Edition(request)
    val excludeTags = request.queryString.getOrElse("exclude-tag", Nil)
    getPopularInTag(edition, tag, excludeTags) map {
      case popular if popular.items.isEmpty => Cached(60)(JsonNotFound())
      case trails => renderPopularInTag(trails)
    }
  }

  private def renderPopularInTag(trails: RelatedContent)(implicit request: RequestHeader): Result = Cached(600) {
    // Initially a fix for PaidFor related content (where this problem is more common), the decision to truncate is due
    // to aesthetic issues with the second slice when there are only 5 or 6 results in related content (7 looks fine).
    val numberOfCards = if (trails.faciaItems.length == 5 || trails.faciaItems.length == 6) 4 else 8
    val html = views.html.fragments.containers.facia_cards.container(
      containerDefinition = onwardContainer("Related content", trails.faciaItems take numberOfCards),
      frontId = request.referrer.map(new URI(_).getPath.stripPrefix("/"))
    )

    JsonComponent(html)
  }
}
