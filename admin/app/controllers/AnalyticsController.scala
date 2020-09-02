package controllers.admin

import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import common.{ImplicitControllerExecutionContext, Logging}
import model.{ApplicationContext, NoCache}

import scala.concurrent.Future

class AnalyticsController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with Logging
    with ImplicitControllerExecutionContext {
  def abtests(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.abtests())))
    }
}
