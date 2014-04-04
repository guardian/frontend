package controllers

import play.api.mvc.{ Controller, Action, RequestHeader }
import common._
import model._
import scala.concurrent.Future
import implicits.Requests
import conf.SwitchingContentApi
import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{Content => ApiContent}
import views.support.{MultimediaContainer, TemplateDeduping, SeriesContainer}

object SeriesController extends Controller with Logging with Paging with ExecutionContexts with Requests {

  implicit def getTemplateDedupingInstance: TemplateDeduping = TemplateDeduping()

  //def renderSeriesStoriesJson()
  def renderSeriesStories(seriesId: String) = Action.async { implicit request =>
    val response = lookup(Edition(request), seriesId) map { seriesItems =>
      seriesItems map { trail => renderSeriesTrails(trail, seriesId) }
    }
    response map { _ getOrElse NotFound }
  }

  private def lookup( edition: Edition, seriesId: String)(implicit request: RequestHeader): Future[Option[Seq[Content]]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching content in series: ${seriesId} the ShortUrl ${currentShortUrl}" )

    def isCurrentStory(content: ApiContent) = content.safeFields.get("shortUrl").map{shortUrl => !shortUrl.equals(currentShortUrl)}.getOrElse(false)

    val promiseOrResponse = SwitchingContentApi().item(seriesId, edition)
      .showTags("all")
      .showFields("all")
      .response
      .map {
        response =>
          response.results filter { content => isCurrentStory(content) } map { result =>
            Content(result)
          } match {
            case Nil => None
            case results => Some(results)
          }
      }

      promiseOrResponse.recover{ case ApiError(404, message) =>
         log.info(s"Got a 404 calling content api: $message" )
         None
      }
  }

  private def renderSeriesTrails(trails: Seq[Content], seriesId: String)(implicit request: RequestHeader) = {
    val series = request.getQueryString("series").getOrElse("")
    val response = () => views.html.fragments.containers.series(Config(id = series, href = Option(seriesId), displayName = Some("More from this series") ), Collection(trails.take(7)), SeriesContainer(), 0)
    renderFormat(response, response, 1)
  }
}
