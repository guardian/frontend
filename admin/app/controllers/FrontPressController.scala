package controllers

import common.{AkkaAsync, ExecutionContexts, Logging}
import jobs.{HighFrequency, LowFrequency, RefreshFrontsJob, StandardFrequency}
import play.api.mvc.{Action, Controller}

class FrontPressController(akkaAsync: AkkaAsync) extends Controller with Logging with ExecutionContexts {

  def press() = Action { implicit request =>
    Ok(views.html.press())
  }

  def queueAllFrontsForPress() = Action { implicit request =>
    RefreshFrontsJob.runAll(akkaAsync) match {
      case Some(l) => Ok(s"Pushed ${l.length} fronts to the SQS queue")
      case None => InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
    }
  }

  def queueHighFrequencyFrontsForPress() = Action { implicit request =>
    runJob(RefreshFrontsJob.runFrequency(akkaAsync)(HighFrequency), "high frequency")
  }

  def queueStandardFrequencyFrontsForPress() = Action { implicit request =>
    runJob(RefreshFrontsJob.runFrequency(akkaAsync)(StandardFrequency), "standard frequency")
  }

  def queueLowFrequencyFrontsForPress() = Action { implicit request =>
    runJob(RefreshFrontsJob.runFrequency(akkaAsync)(LowFrequency), "low frequency")
  }

  private def runJob(didRun: Boolean, jobName: String) = {
    if(didRun) Ok(s"Pushed $jobName fronts to the SQS queue")
    else InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
  }
}

