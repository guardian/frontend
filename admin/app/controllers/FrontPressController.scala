package controllers

import common.{PekkoAsync, ImplicitControllerExecutionContext, GuLogging}
import jobs.{HighFrequency, LowFrequency, RefreshFrontsJob, StandardFrequency}
import model.ApplicationContext
import play.api.mvc._

class FrontPressController(pekkoAsync: PekkoAsync, val controllerComponents: ControllerComponents)(implicit
    context: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  def press(): Action[AnyContent] =
    Action { implicit request =>
      Ok(views.html.press())
    }

  def queueAllFrontsForPress(): Action[AnyContent] =
    Action { implicit request =>
      RefreshFrontsJob.runAll(pekkoAsync) match {
        case Some(l) => Ok(s"Pushed ${l.length} fronts to the SQS queue")
        case None => InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
      }
    }

  def queueHighFrequencyFrontsForPress(): Action[AnyContent] =
    Action { implicit request =>
      runJob(RefreshFrontsJob.runFrequency(pekkoAsync)(HighFrequency), "high frequency")
    }

  def queueStandardFrequencyFrontsForPress(): Action[AnyContent] =
    Action { implicit request =>
      runJob(RefreshFrontsJob.runFrequency(pekkoAsync)(StandardFrequency), "standard frequency")
    }

  def queueLowFrequencyFrontsForPress(): Action[AnyContent] =
    Action { implicit request =>
      runJob(RefreshFrontsJob.runFrequency(pekkoAsync)(LowFrequency), "low frequency")
    }

  private def runJob(didRun: Boolean, jobName: String): Result = {
    if (didRun) Ok(s"Pushed $jobName fronts to the SQS queue")
    else InternalServerError("Could not push to the SQS queue, is there an SNS topic set? (frontPressSns)")
  }
}
