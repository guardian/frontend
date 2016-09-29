package controllers

import common._
import feed.MostViewedVideoAgent
import model.{Content, Video, Cached}
import play.api.mvc.{Action, Controller}
import contentapi.ContentApiClient

class MostViewedVideoController(contentApiClient: ContentApiClient, mostViewedVideoAgent: MostViewedVideoAgent) extends Controller with Logging with ExecutionContexts {

  // Move this out of here if the test is successful
  def renderInSeries(series: String) = Action.async { implicit request =>
    val page = (request.getQueryString("page") getOrElse "1").toInt
    val edition = Edition(request)

    contentApiClient.getResponse(contentApiClient.search(edition)
      .tag(series)
      .contentType("video")
      .showTags("series")
      .showFields("headline")
      .page(page)
      .pageSize(6)
    ).map { response =>
      val videos = response.results.toList.map(apiContent => {
        val content = Content.make(apiContent)
        Video.make(content)
      })

      val seriesTitle = response.results.toList.lift(1).flatMap { result =>
        result.tags.find(tag => tag.id == series).map(tag => tag.webTitle)
      }

      val pagination = Pagination(page, response.pages, response.total)

      Cached(900) {
        JsonComponent(views.html.fragments.videosInSeries(videos, seriesTitle, series, pagination))
      }
    }
  }

  def renderMostViewed() = Action { implicit request =>

    val size = request.getQueryString("size").getOrElse("6").toInt
    val videos = mostViewedVideoAgent.mostViewedVideo().take(size)

    if (videos.nonEmpty) {
      Cached(900) {
        JsonComponent(views.html.fragments.mostViewedVideo(videos))
      }
    } else {
      Cached(60) {
        JsonComponent("html" -> "{}")
      }
    }
  }
}
