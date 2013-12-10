package controllers.admin

import common.ExecutionContexts
import play.api.mvc._
import services.OphanApi
import model.NoCache


object OphanApiController extends Controller with ExecutionContexts {

  def pageViews(path: String) = Authenticated.async { request =>
    OphanApi.getBreakdown(path) map (body => NoCache(Ok(body) as "application/json"))
  }

  def platformPageViews = Authenticated.async { request =>
    OphanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => NoCache(Ok(body) as "application/json"))
  }
}
