package controllers

import common.{ExecutionContexts, JsonComponent, Logging}
import feed.MostViewedVideoAgent
import model.Cached
import play.api.mvc.{Action, Controller}

object MostViewedVideoController extends Controller with Logging with ExecutionContexts {

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
