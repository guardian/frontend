package controllers.admin

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import model.NoCache
import scala.concurrent.Future

object AnalyticsController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def abtests() = AuthActions.AuthActionTest.async { request =>
    Future(NoCache(Ok(views.html.abtests("PROD"))))
  }
}
