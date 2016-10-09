package controllers.commercial

import common.JsonComponent
import model.commercial.{Segment, Job}
import model.commercial.jobs.{JobSector, JobsAgent}
import model.{Cached, NoCache}
import play.api.mvc._
import play.api.libs.json.Json
import scala.concurrent.duration._

class JobsController(jobsAgent: JobsAgent) extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  val jobSectors = Seq(
    JobSector("arts", "Arts"),
    JobSector("graduate", "Graduate"),
    JobSector("social-care", "Social care"),
    JobSector("charity", "Charity"),
    JobSector("health", "Health"),
    JobSector("higher-education", "Higher education"),
    JobSector("environment", "Environment"),
    JobSector("housing", "Housing"),
    JobSector("schools", "Schools"),
    JobSector("government", "Government"),
    JobSector("media", "Media")
  )

  private def jobSample(specificIds: Seq[String], segment: Segment): Seq[Job] =
    (jobsAgent.specificJobs(specificIds) ++ jobsAgent.jobsTargetedAt(segment)).distinct.take(2)

  def renderJobs = Action { implicit request =>
    jobSample(specificIds, segment) match {
      case Nil => Cached(60.seconds) {
        jsonFormat.nilResult
      }
      case jobs => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.jobs.jobs(jobs, jobSectors, omnitureId, clickMacro))
      }
    }
  }

  def getJobs = Action { implicit request =>
      Cached(60.seconds){
        JsonComponent(jobSample(specificIds, segment))
      }
  }
}
