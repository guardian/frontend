package controllers.admin

import common.ExecutionContexts
import play.api.mvc._
import services.OphanApi
import model.NoCache


object OphanApiController extends Controller with ExecutionContexts {

  def pageViews(path: String) = AuthActions.AuthAction.async { request =>
    OphanApi.getBreakdown(path) map (body => NoCache(Ok(body) as "application/json"))
  }

  def platformPageViews = AuthActions.AuthAction.async { request =>
    OphanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => NoCache(Ok(body) as "application/json"))
  }

  def adsRenderTime = AuthActions.AuthAction.async { request =>
    OphanApi.getAdsRenderTime(request.queryString) map (body => NoCache(Ok(body) as "application/json"))
  }

}
