package controllers

import play.api.mvc._
import services.OphanApi
import common.ExecutionContexts


object FaciaOphanApiController extends Controller with ExecutionContexts {

  def pageViews(path: String) = AjaxExpiringAuthentication.async { request =>
    OphanApi.getBreakdown(path) map (body => Ok(body) as "application/json")
  }

}
