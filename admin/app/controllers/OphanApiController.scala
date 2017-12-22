package controllers.admin

import common.ImplicitControllerExecutionContext
import conf.switches.Switches
import controllers.AdminAudit
import play.api.mvc._
import services.OphanApi
import model.NoCache

class OphanApiController(ophanApi: OphanApi, val controllerComponents: ControllerComponents) extends BaseController with ImplicitControllerExecutionContext {

  def pageViews(path: String): Action[AnyContent] = Action.async { implicit request =>
    AdminAudit.endpointAuditF(Switches.AdminRemoveOphan) {
      ophanApi.getBreakdown(path) map (body => NoCache(Ok(body) as "application/json"))
    }
  }

  def platformPageViews: Action[AnyContent] = Action.async { implicit request =>
    AdminAudit.endpointAuditF(Switches.AdminRemoveOphan) {
      ophanApi.getBreakdown(platform = "next-gen", hours = 2) map (body => NoCache(Ok(body) as "application/json"))
    }
  }

  def adsRenderTime: Action[AnyContent] = Action.async { implicit request =>
    AdminAudit.endpointAuditF(Switches.AdminRemoveOphan) {
      ophanApi.getAdsRenderTime(request.queryString) map (body => NoCache(Ok(body) as "application/json"))
    }
  }

}
