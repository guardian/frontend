package controllers.commercial

import play.api.mvc._
import scala.util.Random
import model.commercial.jobs.{LightJobsAgent, JobsAgent}
import common.{JsonComponent, ExecutionContexts}

object JobAds extends Controller with ExecutionContexts with ExpectsSegmentInRequests {

  def jobs = Action {
    implicit request =>
      val jobs = JobsAgent.matchingAds(segment)
      if (jobs.isEmpty) {
        noMatchingSegmentsResult
      } else {
        val shuffled = Random.shuffle(jobs)
        JsonComponent {
          views.html.jobs(shuffled take 5)
        } withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

  // New light jobs feed available only in dev env
  def lightJobs = Action {
    implicit request =>
      val jobs = LightJobsAgent.matchingAds(segment)
      if (jobs.isEmpty) {
        noMatchingSegmentsResult
      } else {
        val shuffled = Random.shuffle(jobs)
        JsonComponent {
          views.html.lightjobs(shuffled take 5)
        } withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
