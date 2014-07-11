package controllers

import common.{Logging, ExecutionContexts}
import feed.MostViewedVideoAgent
import model.Cached
import play.api.mvc.{ Controller, Action }

object MostViewedVideoController extends Controller with Logging with ExecutionContexts {

  def renderView() = Action { implicit request =>

    val videos = MostViewedVideoAgent.mostViewedVideo()

    Cached(900) {
      Ok(views.html.fragments.mostViewedVideo(videos))
    }
  }
}
