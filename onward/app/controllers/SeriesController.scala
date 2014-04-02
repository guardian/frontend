package controllers

import play.api.mvc.{ Controller, Action, RequestHeader }
import common._
import model._
import scala.concurrent.Future
import implicits.Requests
import conf.SwitchingContentApi
import com.gu.openplatform.contentapi.ApiError
import com.gu.openplatform.contentapi.model.{Content => ApiContent}

object SeriesController extends Controller with Logging with Paging with ExecutionContexts with Requests {

  //def renderSeriesStoriesJson()
  def renderSeriesStories(seriesId: String) = Action.async { implicit request =>
    println("Lets fetch some motherfuckin' series, mo FO! %s".format(seriesId))
    val response = lookup(Edition(request), seriesId) map { seriesItems =>
      seriesItems map { renderSeriesTrails(_) }
    }
    response map { _ getOrElse NotFound }
  }

  //TODO pass in the id to dedupde here
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

  private def renderSeriesTrails(trails: Seq[Trail])(implicit request: RequestHeader) = {
    println("We have %d trails".format(trails.length))
    val response = () => views.html.fragments.relatedTrails(trails, "More from ", 5)
    renderFormat(response, response, 1)
  }
}
