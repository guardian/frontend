package controllers.commercial

import model.commercial.jobs.{Job, JobsAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.api.templates.Html
import scala.concurrent.Future

object JobAds extends Controller {

  implicit val codec = Codec.utf_8

  object lowRelevance extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader): Html =
      views.html.jobs(jobs)
  }

  object highRelevance extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader): Html =
      views.html.jobsHigh(jobs)
  }

  private def renderJobs(relevance: Relevance[Job], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        JobsAgent.adsTargetedAt(segment) match {
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
