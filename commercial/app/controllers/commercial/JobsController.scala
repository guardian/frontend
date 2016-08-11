package controllers.commercial

import model.commercial.jobs.{JobSector, JobsAgent}
import model.{Cached, NoCache}
import play.api.mvc._

class JobsController extends Controller with implicits.Requests {

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

  def renderJobs = Action { implicit request =>
    (JobsAgent.specificJobs(specificIds) ++ JobsAgent.jobsTargetedAt(segment)).distinct match {
      case Nil => NoCache(jsonFormat.nilResult.result)
      case jobs => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.jobs.jobs(jobs.take(2), jobSectors, omnitureId, clickMacro))
      }
    }
  }
}
