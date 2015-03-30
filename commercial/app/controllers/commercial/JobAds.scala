package controllers.commercial

import model.commercial.jobs.{Job, JobsAgent}
import model.{NoCache, Cached}
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

          jsonFormat.result(views.html.jobs.jobs(jobs.take(2), omnitureId, clickMacro))
        }
      }
    }
  }

}
