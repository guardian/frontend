package controllers.admin

import play.api.mvc.{Action, AnyContent, Controller}
import common.{ExecutionContexts, Logging}
import model.{ApplicationContext, NoCache}

import scala.concurrent.Future

class AnalyticsController(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {
    def abtests(): Action[AnyContent] = Action.async { implicit request =>
    Future(NoCache(Ok(views.html.abtests())))
  }
}
