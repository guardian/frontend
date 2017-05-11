package controllers.admin

import common.ExecutionContexts
import play.api.mvc._
import services.OphanApi
import model.NoCache

class OphanApiController(ophanApi: OphanApi) extends Controller with ExecutionContexts {

  def pageViews(path: String): Action[AnyContent] = Action.async {
    ophanApi.getBreakdown(path) map (body => NoCache(Ok(body) as "application/json"))
  }

  def platformPageViews: Action[AnyContent] = Action.async {
    ophanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => NoCache(Ok(body) as "application/json"))
  }

  def adsRenderTime: Action[AnyContent] = Action.async { request =>
    ophanApi.getAdsRenderTime(request.queryString) map (body => NoCache(Ok(body) as "application/json"))
  }

}
