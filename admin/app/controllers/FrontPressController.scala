package controllers

import common.{ExecutionContexts, Logging}
import controllers.admin.AuthActions
import jobs.{LowFrequency, StandardFrequency, HighFrequency, RefreshFrontsJob}
import pagepresser.Presser
import play.api.mvc.Controller

object FrontPressController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def press() = AuthActions.AuthActionTest { request =>
    Ok(views.html.press())
  }

  def queueAllFrontsForPress() = AuthActions.AuthActionTest { request =>
    RefreshFrontsJob.runAll() match {
      case Some(l) => Ok(s"Pushed ${l.length} fronts to the SQS queue")
      case None => InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
    }
  }

  def queueHighFrequencyFrontsForPress() = AuthActions.AuthActionTest { request =>
    runJob(RefreshFrontsJob.runFrequency(HighFrequency), "high frequency")
  }

  def queueStandardFrequencyFrontsForPress() = AuthActions.AuthActionTest { request =>
    runJob(RefreshFrontsJob.runFrequency(StandardFrequency), "standard frequency")
  }

  def queueLowFrequencyFrontsForPress() = AuthActions.AuthActionTest { request =>
    runJob(RefreshFrontsJob.runFrequency(LowFrequency), "low frequency")
  }

  private def runJob(didRun: Boolean, jobName: String) = {
    if(didRun) Ok(s"Pushed $jobName fronts to the SQS queue")
    else InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
  }
}

