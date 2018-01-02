package controllers.admin

import common.ImplicitControllerExecutionContext
import conf.switches.Switches
import controllers.AdminAudit
import model.{ApplicationContext, Cached}
import model.Cached.RevalidatableResult
import play.api.mvc._

class SiteController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with ImplicitControllerExecutionContext {

  def index: Action[AnyContent] = Action { implicit request =>
    AdminAudit.endpointAudit(Switches.AdminRemoveAdminFootball) {
      Cached(60)(RevalidatableResult.Ok(views.html.football.index()))
    }
  }

}
