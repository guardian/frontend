package controllers.admin

import play.api.mvc.{Action, Controller}
import common.{ExecutionContexts, Logging}
import model.NoCache

import scala.concurrent.Future
import play.api.Environment

class AnalyticsController(implicit env: Environment) extends Controller with Logging with ExecutionContexts {
  def abtests() = Action.async { implicit request =>
    Future(NoCache(Ok(views.html.abtests())))
  }
}
