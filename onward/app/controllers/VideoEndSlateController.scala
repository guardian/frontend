package controllers

import com.gu.contentapi.client.GuardianContentApiError
import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import common._
import contentapi.ContentApiClient
import contentapi.ContentApiClient.getResponse
import implicits.Requests
import model._
import play.api.mvc.{Action, Controller, RequestHeader}

import scala.concurrent.Future

object VideoEndSlateController extends Controller with Logging with Paging with ExecutionContexts with Requests {

  def renderSection(sectionId: String) = Action.async { implicit request =>
    val response = lookupSection(Edition(request), sectionId) map { seriesItems =>
      renderSectionTrails(seriesItems)
    }
    response
  }

  private def lookupSection(edition: Edition, sectionId: String)(implicit request: RequestHeader): Future[Seq[Video]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching video content in section: $sectionId" )

    def isCurrentStory(content: ApiContent) = content.fields.flatMap(_.shortUrl).exists(_ == currentShortUrl)

    val promiseOrResponse = getResponse(ContentApiClient.search(edition)
      .section(sectionId)
      .tag("type/video")
      .showTags("all")
      .showFields("all")
    ).map {
        response =>
          response.results filter { content => !isCurrentStory(content) } map { result =>
            Content(result)
          } collect {
            case v: Video => v
          }
      }

      promiseOrResponse.recover{ case GuardianContentApiError(404, message, _) =>
         log.info(s"Got a 404 calling content api: $message" )
         Nil
      }
  }

  private def renderSectionTrails(trails: Seq[Video])(implicit request: RequestHeader) = {
    val sectionName = trails.headOption.map(t => t.trail.sectionName).getOrElse("")
    val response = () => views.html.fragments.videoEndSlate(trails.take(4), "section", s"More ${sectionName} videos")
    renderFormat(response, response, 1)
  }

  def renderSeries(seriesId: String) = Action.async { implicit request =>
    val response = lookupSeries(Edition(request), seriesId) map { seriesItems =>
      renderSeriesTrails(seriesItems)
    }

    response
  }

  private def lookupSeries( edition: Edition, seriesId: String)(implicit request: RequestHeader): Future[Seq[Video]] = {
    val currentShortUrl = request.getQueryString("shortUrl").getOrElse("")
    log.info(s"Fetching content in series: ${seriesId} the ShortUrl ${currentShortUrl}" )

    def isCurrentStory(content: ApiContent) = content.fields.flatMap(_.shortUrl).exists(_ == currentShortUrl)

    val promiseOrResponse = getResponse(ContentApiClient.item(seriesId, edition)
      .tag("type/video")
      .showTags("all")
      .showFields("all")
    ).map { response =>
      response.results.getOrElse(Nil) filter { content => !isCurrentStory(content) } map { result =>
        Content(result)
      } collect {
        case v: Video => v
      }
    }

    promiseOrResponse.recover{ case GuardianContentApiError(404, message, _) =>
      log.info(s"Got a 404 calling content api: $message" )
      Nil
    }
  }

  private def renderSeriesTrails(trails: Seq[Video])(implicit request: RequestHeader) = {
    val response = () => views.html.fragments.videoEndSlate(trails.take(4), "series", "More from this series")
    renderFormat(response, response, 1)
  }
}
