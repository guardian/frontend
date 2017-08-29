package controllers.admin

import play.api.mvc.{BaseController, ControllerComponents}
import common.{ExecutionContexts, Logging}
import model.{ApplicationContext, NoCache}

import scala.concurrent.Future

class AnalyticsController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext) extends BaseController with Logging with ExecutionContexts {
    def abtests() = Action.async { implicit request =>
    Future(NoCache(Ok(views.html.abtests())))
  }
}
