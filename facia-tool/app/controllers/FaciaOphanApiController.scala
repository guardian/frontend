package controllers

import play.api.mvc._
import services.OphanApi
import common.ExecutionContexts


object FaciaOphanApiController extends Controller with ExecutionContexts {

  def pageViews(path: String) = Authenticated.async { request =>
    OphanApi.getBreakdown(path) map (body => Ok(body) as "application/json")
  }

  def platformPageViews = Authenticated.async { request =>
    OphanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => Ok(body) as "application/json")
  }

}
