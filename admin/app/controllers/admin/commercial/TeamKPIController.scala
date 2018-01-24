package controllers.admin.commercial

import common.Logging
import model.ApplicationContext
import play.api.i18n.I18nSupport
import play.api.mvc._

class TeamKPIController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
  extends BaseController
  with I18nSupport
  with Logging {

  def renderBaselineDashboard(): Action[AnyContent] = Action { implicit request =>
    // The test variants for the team KPIs are commercialBaselineControl-control and commercialBaselineVariant-variant.
    DashboardRenderer.renderDashboard("commercialBaseline")
  }
}
