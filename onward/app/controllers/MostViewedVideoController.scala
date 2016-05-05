package controllers

import common.{Edition, ExecutionContexts, JsonComponent, Logging}
import feed.MostViewedVideoAgent
import model.{Content, Video, Cached}
import play.api.mvc.{Action, Controller}
import contentapi.ContentApiClient
import contentapi.ContentApiClient.getResponse

object MostViewedVideoController extends Controller with Logging with ExecutionContexts {

  // Move this out of here if the test is successful
  def renderInSeries(series: String) = Action.async { implicit request =>
    val page = (request.getQueryString("page") getOrElse "1").toInt
    val edition = Edition(request)
    val nextPage = Some(page + 1)
    val prevPage = if (page > 1) Some(page - 1) else None

    getResponse(ContentApiClient.search(edition)
      .tag(series)
      .showTags("all")
      .showFields("all")
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

      Cached(900) {
        JsonComponent(
          "html" -> views.html.fragments.videosInSeries(videos, seriesTitle, series, nextPage, prevPage)
        )
      }
    }
  }

  def renderMostViewed() = Action { implicit request =>

    val size = request.getQueryString("size").getOrElse("6").toInt
    val videos = MostViewedVideoAgent.mostViewedVideo().take(size)

    if (videos.nonEmpty) {
      Cached(900) {
        JsonComponent(
          "html" -> views.html.fragments.mostViewedVideo(videos)
        )
      }
    } else {
      Cached(60) {
        JsonComponent("html" -> "{}")
      }
    }
  }
}
