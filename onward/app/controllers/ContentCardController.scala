package controllers

import com.gu.contentapi.client.model.v1.ItemResponse
import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import contentapi.ContentApiClient
import implicits.Requests
import layout.ContentCard
import model.{ApplicationContext, Cached, NoCache}
import play.api.mvc.{Action, Controller, RequestHeader, Result}
import play.twirl.api.HtmlFormat

import scala.concurrent.Future

class ContentCardController(contentApiClient: ContentApiClient)(implicit context: ApplicationContext) extends Controller with Paging with Logging with ExecutionContexts with Requests   {

  val DefaultGroup = 0
  val DefaultCard = 1

  def renderHtml(path: String) = render(path, Some(DefaultGroup), Some(DefaultCard))

  def render(path: String, group: Option[Int], card: Option[Int]) = Action.async { implicit request =>
    lookup(path) map { content =>
      content.map(renderContent(group.getOrElse(DefaultGroup), card.getOrElse(DefaultCard))).getOrElse(NotFound)
    }
  }


  private def lookup(path: String)(implicit request: RequestHeader): Future[Option[ContentCard]] = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition: ${edition.id}:")

    val response: Future[ItemResponse] = contentApiClient.getResponse(
      contentApiClient.item(path, edition)
        .showFields("headline,standfirst,shortUrl,webUrl,byline,trailText,liveBloggingNow,commentCloseDate,commentable")
        .showTags("all")
        .showElements("all")
    )

    response.map { response =>
      response.content flatMap { content =>
        ContentCard.makeFromApiContent(content)
      }
    }
  }


  private def renderContent(group: Int, card: Int)(implicit request: RequestHeader): ContentCard => Result = (content: ContentCard) => {
    def contentResponse: HtmlFormat.Appendable = views.html.fragments.items.facia_cards.contentCard(content, group, card, "all", false, false)(request)

    if (!request.isJson) NoCache(Ok(contentResponse))
    else Cached(900) {
      JsonComponent(contentResponse)
    }
  }


}
