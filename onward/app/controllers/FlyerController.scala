package controllers

import play.api.mvc.{RequestHeader, Action, Controller}
import common.{JsonComponent, Edition, ExecutionContexts, Logging}
import implicits.Requests
import model.{NoCache, Cached, Content}
import scala.concurrent.Future
import conf.LiveContentApi
import com.gu.contentapi.client.model.ItemResponse
import play.twirl.api.HtmlFormat
import LiveContentApi.getResponse

object FlyerController extends Controller with Paging with Logging with ExecutionContexts with Requests   {

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
        .showFields("headline,standfirst,shortUrl,webUrl,byline,starRating,trailText,liveBloggingNow")
        .showTags("all")
        .showElements("all")
    )

    response.map { response => response.content.map(Content(_))  }
  }

  private def renderContent(content: Content)(implicit request: RequestHeader) = {
    def contentResponse: HtmlFormat.Appendable = views.html.fragments.flyerBody(content)(request)

    if (!request.isJson) NoCache(Ok(views.html.flyer(content)(request)))
    else Cached(900) {
      JsonComponent(
         "html" -> contentResponse
      )
    }
  }
}
