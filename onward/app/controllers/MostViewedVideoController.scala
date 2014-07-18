package controllers

import common.{JsonComponent, Logging, ExecutionContexts}
import feed.MostViewedVideoAgent
import model.Cached
import play.api.mvc.{ Controller, Action }

object MostViewedVideoController extends Controller with Logging with ExecutionContexts {

  def renderMostViewed() = Action { implicit request =>

    val videos = MostViewedVideoAgent.mostViewedVideo().take(6)

    Cached(900) {
      JsonComponent(
        "html" -> views.html.fragments.mostViewedVideo(videos)
      )
    }
  }
}
