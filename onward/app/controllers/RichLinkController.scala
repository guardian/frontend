package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{ExecutionContexts, Logging}
import contentapi.ContentApiClient
import implicits.Requests
import model.{ApplicationContext, Content, ContentType}
import play.api.mvc.{Action, RequestHeader}

class RichLinkController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends RenderTemplateController(contentApiClient) with Paging with Logging with ExecutionContexts with Requests   {

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map { response: ItemResponse =>
      response.content.map(Content(_)) match {
        case Some(content) => renderContent(richLinkHtml(content), richLinkBodyHtml(content))
        case None => NotFound
      }
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader) = {
    val fields = "headline,standfirst,shortUrl,webUrl,byline,starRating,trailText,liveBloggingNow"
    lookup(path, fields)(request)
  }

  private def richLinkHtml(content: ContentType)(implicit request: RequestHeader, context: ApplicationContext) =
    views.html.richLink(content)(request, context)

  private def richLinkBodyHtml(content: ContentType)(implicit request: RequestHeader, context: ApplicationContext) =
    views.html.fragments.richLinkBody(content)(request)

}
