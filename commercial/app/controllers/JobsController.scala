package commercial.controllers

import common.JsonComponent
import commercial.model.Segment
import commercial.model.merchandise.Job
import commercial.model.merchandise.jobs.JobsAgent
import model.Cached
import play.api.mvc._
import scala.concurrent.duration._

class JobsController(jobsAgent: JobsAgent, val controllerComponents: ControllerComponents)
    extends BaseController
    with implicits.Requests {

  implicit val codec = Codec.utf_8

  private def jobSample(specificIds: Seq[String], segment: Segment): Seq[Job] =
    (jobsAgent.specificJobs(specificIds) ++ jobsAgent.jobsTargetedAt(segment)).distinct.take(2)

  def getJobs: Action[AnyContent] =
    Action { implicit request =>
      Cached(60.seconds) {
        JsonComponent.fromWritable(jobSample(specificIds, segment))
      }
    }
}
