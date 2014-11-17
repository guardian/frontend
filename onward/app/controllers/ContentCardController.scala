package controllers

import play.api.mvc.{RequestHeader, Action, Controller}
import common.{JsonComponent, Edition, ExecutionContexts, Logging}
import implicits.Requests
import model.{Cached, Content}
import scala.concurrent.Future
import com.gu.contentapi.client.model.ItemResponse
import conf.LiveContentApi
import common.`package`._
import com.gu.contentapi.client.model.ItemResponse
import play.twirl.api.HtmlFormat
import conf.Switches._
import play.api.libs.json.Json.toJson

object ContentCardController extends Controller with Paging with Logging with ExecutionContexts with Requests   {

  def renderHtml(path: String) = render(path)

  def render(path: String) = Action.async { implicit request =>
    lookup(path) map { series =>
      series.map(renderContent).getOrElse(NotFound)
    }
  }

  private def lookup(path: String)(implicit request: RequestHeader): Future[Option[Content]] = {
    val edition = Edition(request)
    log.info(s"Fetching article: $path for edition: ${edition.id}:")

    val response: Future[ItemResponse] = LiveContentApi.item(path, edition)
      .showFields("all")
      .showTags("all")
      .showElements("all")
      .response

    response.map { response => response.content.map(Content(_))  }
  }

  private def renderContent(content: Content)(implicit request: RequestHeader) = {
    def contentResponse: HtmlFormat.Appendable = {
      if ( !content.isGallery)
        views.html.fragments.contentCardBody(content)(request)
      else
        views.html.fragments.galleryContentCard(content)(request)
    }
     //val jsonResponse = () => contentResponse
     //val htmlResponse = () => views.html.contentCard(content)(request)
     //renderFormat(htmlResponse, jsonResponse, 900)


     if (!request.isJson) Cached(900) {Ok(views.html.contentCard(content)(request))}
     else Cached(900) {
       JsonComponent(
          "html" -> contentResponse,
          "refreshStatus" -> toJson(AutoRefreshSwitch.isSwitchedOn)
       )

     }

  }
}
