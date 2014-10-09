package controllers.commercial

import model.commercial.jobs.{Job, JobsAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object JobAds extends Controller {

  implicit val codec = Codec.utf_8

  object lowRelevance extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader) = views.html.jobs(jobs)
  }
  object lowRelevanceV2 extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader) = views.html.jobsV2(jobs)
  }

  object highRelevance extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader) = views.html.jobsHigh(jobs)
  }
  object highRelevanceV2 extends Relevance[Job] {
    override def view(jobs: Seq[Job])(implicit request: RequestHeader) = views.html.jobsHighV2(jobs)
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
  def jobsLowJsonV2 = renderJobs(lowRelevanceV2, jsonFormat)

  def jobsHighHtml = renderJobs(highRelevance, htmlFormat)
  def jobsHighJson = renderJobs(highRelevance, jsonFormat)
  def jobsHighJsonV2 = renderJobs(highRelevanceV2, jsonFormat)
}
