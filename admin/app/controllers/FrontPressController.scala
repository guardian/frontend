package controllers

import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import jobs.RefreshFrontsJob
import play.api.mvc.Controller

object FrontPressController extends Controller with Logging with AuthLogging with ExecutionContexts {
  def queueAllFrontsForPress() = AuthActions.AuthActionTest { request =>
    RefreshFrontsJob.runAll() match {
      case Some(l) => Ok(s"Pushed ${l.length} fronts to the SQS queue")
      case None => InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
    }
  }
}

