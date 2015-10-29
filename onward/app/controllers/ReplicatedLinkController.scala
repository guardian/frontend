package controllers

import com.gu.contentapi.client.model.ItemResponse
import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import conf.LiveContentApi
import conf.LiveContentApi.getResponse
import implicits.Requests
import model.{Cached, Content, NoCache}
import play.api.mvc.{Action, Controller, RequestHeader}
import play.twirl.api.HtmlFormat

import scala.concurrent.Future

object ReplicatedLinkController extends Controller with Paging with Logging with ExecutionContexts with Requests   {

  def renderHtml(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map { content =>
      content.map(renderContent).getOrElse(NotFound)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Option[Content]] = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition: ${edition.id}:")

    val response: Future[ItemResponse] = getResponse(
      LiveContentApi.item(path, edition)
        .showFields("headline")
    )

    response.map { response => response.content.map(Content(_))  }
  }

  private def renderContent(content: Content)(implicit request: RequestHeader) = {
    if (!request.isJson) NoCache(Ok(content.headline))
    else Cached(900) {
      JsonComponent(
         "headline" -> content.headline
      )
    }
  }
}
