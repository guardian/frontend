package controllers.commercial

import model.commercial.jobs.{Job, JobsAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object JobAds extends Controller with implicits.Requests {

  implicit val codec = Codec.utf_8

  object lowRelevance extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader) = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.jobs(jobs, omnitureId, clickMacro)
    }
  }

  object highRelevance extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader) = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.jobsHigh(jobs, omnitureId, clickMacro)
    }
  }

  private def renderJobs(relevance: Relevance[Job], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        (JobsAgent.specificJobs(specificIds) ++ JobsAgent.jobsTargetedAt(segment)).distinct match {
          case Nil => NoCache(format.nilResult)
          case jobs => Cached(componentMaxAge) {
            format.result(relevance.view(jobs take 2))
          }
        }
      }
    }

  def jobsLowHtml = renderJobs(lowRelevance, htmlFormat)
  def jobsLowJson = renderJobs(lowRelevance, jsonFormat)

  def jobsHighHtml = renderJobs(highRelevance, htmlFormat)
  def jobsHighJson = renderJobs(highRelevance, jsonFormat)
}
