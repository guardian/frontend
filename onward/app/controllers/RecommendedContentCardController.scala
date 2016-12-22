package controllers

import contentapi.ContentApiClient
import layout.ContentCard
import model.ApplicationContext
import play.api.mvc.{Action, RequestHeader}

import scala.concurrent.Future

class RecommendedContentCardController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends OnwardContentCardController(contentApiClient) {

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map {
      case Some(card) => {
        val contentCardHtml = contentResponse(card)
        renderContent(contentCardHtml, contentCardHtml)
      }
      case None => NotFound
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Option[ContentCard]] = {
    val fields = "headline,standfirst,shortUrl,webUrl,byline,trailText,liveBloggingNow,commentCloseDate,commentable"

    val response = lookup(path, fields)(request)

    response map { _.content flatMap (ContentCard.fromApiContent(_))}
  }

  private def contentResponse(content: ContentCard)(implicit request: RequestHeader) = {
    views.html.fragments.items.facia_cards.contentCard(
      item = content,
      containerIndex = 0,
      index = 1,
      visibilityDataAttribute = "all",
      isFirstContainer = false,
      isList = false)(request)
  }

}
