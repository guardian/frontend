package controllers

import common.ExecutionContexts
import liveblogs.LatestBlocks
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

object LiveBlogUpdatesController extends Controller with ExecutionContexts {
  def latest = Action.async { request =>
    LatestBlocks.getOrRefresh map { latestBlocks =>
      Ok(Json.toJson(latestBlocks))
    }
  }
}
