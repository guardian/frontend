package controllers.admin

import common.ImplicitControllerExecutionContext
import play.api.mvc._
import services.OphanApi
import model.NoCache

class OphanApiController(ophanApi: OphanApi, val controllerComponents: ControllerComponents) extends BaseController with ImplicitControllerExecutionContext {

  def pageViews(path: String) = Action.async { request =>
    ophanApi.getBreakdown(path) map (body => NoCache(Ok(body) as "application/json"))
  }

  def platformPageViews = Action.async { request =>
    ophanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => NoCache(Ok(body) as "application/json"))
  }

  def adsRenderTime = Action.async { request =>
    ophanApi.getAdsRenderTime(request.queryString) map (body => NoCache(Ok(body) as "application/json"))
  }

}
