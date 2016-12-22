package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import contentapi.ContentApiClient
import layout.ContentCard
import model.ApplicationContext
import play.api.mvc.{Action, RequestHeader}

import scala.concurrent.Future

class RecommendedContentCardController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends RenderTemplateController(contentApiClient) {

  def render(path: String) = Action.async { implicit request =>
    makeContentCardHtml(lookup(path)) map {
      case Some(html) => renderContent(html, html)
      case None => NotFound
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[ItemResponse] = {
    val fields = "headline,standfirst,shortUrl,webUrl,byline,trailText,liveBloggingNow,commentCloseDate,commentable"
    lookup(path, fields)(request)
  }


  private def makeContentCardHtml(response: Future[ItemResponse])(implicit request: RequestHeader) = response.map { response =>
    for {
      content <- response.content
      contentCard <- ContentCard.fromApiContent(content)
    } yield contentResponse(contentCard)
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
