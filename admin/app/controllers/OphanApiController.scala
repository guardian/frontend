package controllers.admin

import common.ExecutionContexts
import play.api.mvc._
import services.OphanApi
import model.NoCache


class OphanApiController extends Controller with ExecutionContexts {

  def pageViews(path: String) = AuthActions.AuthActionTest.async { request =>
    OphanApi.getBreakdown(path) map (body => NoCache(Ok(body) as "application/json"))
  }

  def platformPageViews = AuthActions.AuthActionTest.async { request =>
    OphanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => NoCache(Ok(body) as "application/json"))
  }

  def adsRenderTime = AuthActions.AuthActionTest.async { request =>
    OphanApi.getAdsRenderTime(request.queryString) map (body => NoCache(Ok(body) as "application/json"))
  }

}
