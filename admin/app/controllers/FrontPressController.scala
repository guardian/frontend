package controllers

import common.{AkkaAsync, ExecutionContexts, Logging}
import controllers.admin.AuthActions
import jobs.{HighFrequency, LowFrequency, RefreshFrontsJob, StandardFrequency}
import play.api.mvc.Controller

class FrontPressController(akkaAsync: AkkaAsync) extends Controller with Logging with AuthLogging with ExecutionContexts {

  def press() = AuthActions.AuthActionTest { implicit request =>
    Ok(views.html.press())
  }

  def queueAllFrontsForPress() = AuthActions.AuthActionTest { implicit request =>
    RefreshFrontsJob.runAll(akkaAsync) match {
      case Some(l) => Ok(s"Pushed ${l.length} fronts to the SQS queue")
      case None => InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
    }
  }

  def queueHighFrequencyFrontsForPress() = AuthActions.AuthActionTest { implicit request =>
    runJob(RefreshFrontsJob.runFrequency(akkaAsync)(HighFrequency), "high frequency")
  }

  def queueStandardFrequencyFrontsForPress() = AuthActions.AuthActionTest { implicit request =>
    runJob(RefreshFrontsJob.runFrequency(akkaAsync)(StandardFrequency), "standard frequency")
  }

  def queueLowFrequencyFrontsForPress() = AuthActions.AuthActionTest { implicit request =>
    runJob(RefreshFrontsJob.runFrequency(akkaAsync)(LowFrequency), "low frequency")
  }

  private def runJob(didRun: Boolean, jobName: String) = {
    if(didRun) Ok(s"Pushed $jobName fronts to the SQS queue")
    else InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
  }
}

