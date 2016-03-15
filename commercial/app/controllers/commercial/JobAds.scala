package controllers.commercial

import model.commercial.jobs.JobsAgent
import model.{Cached, NoCache}
import performance.MemcachedAction
import play.api.mvc._

import scala.concurrent.Future

object JobAds extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  def renderJobs = MemcachedAction { implicit request =>
    Future.successful {
      (JobsAgent.specificJobs(specificIds) ++ JobsAgent.jobsTargetedAt(segment)).distinct match {
        case Nil => NoCache(jsonFormat.nilResult)
        case jobs => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")

          if(conf.switches.Switches.v2JobsTemplate.isSwitchedOn) {
            jsonFormat.result(views.html.jobs.jobsV2(jobs.take(2), omnitureId, clickMacro))
          } else {
            jsonFormat.result(views.html.jobs.jobs(jobs.take(2), omnitureId, clickMacro))
          }
        }
      }
    }
  }
}
