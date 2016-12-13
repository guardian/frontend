package controllers

import play.api.mvc.{Action, Controller, RequestHeader}
import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import implicits.Requests
import model.{ApplicationContext, Cached, Content, ContentType, NoCache}
import scala.concurrent.Future
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.ItemResponse
import play.twirl.api.HtmlFormat

class RichLinkController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Paging with Logging with ExecutionContexts with Requests   {

  def renderHtml(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map { content =>
      content.map(renderContent).getOrElse(NotFound)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Option[ContentType]] = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition: ${edition.id}:")

    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient.item(path, edition)
        .showFields("headline,standfirst,shortUrl,webUrl,byline,starRating,trailText,liveBloggingNow")
        .showTags("all")
        .showElements("all")
    )

    response.map { response => response.content.map(Content(_))  }
  }

  private def renderContent(content: ContentType)(implicit request: RequestHeader) = {
    def contentResponse: HtmlFormat.Appendable = views.html.fragments.richLinkBody(content)(request)

    if (!request.isJson) NoCache(Ok(views.html.richLink(content)(request, context)))
    else Cached(900) {
      JsonComponent(contentResponse)
    }
  }
}
