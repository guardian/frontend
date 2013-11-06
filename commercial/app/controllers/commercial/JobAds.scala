package controllers.commercial

import play.api.mvc._
import scala.util.Random
import model.commercial.jobs.JobsAgent
import common.{JsonComponent, ExecutionContexts}

object JobAds extends Controller with ExecutionContexts with ExpectsSegmentInRequests {

  def jobs = Action {
    implicit request =>
      val jobs = JobsAgent.matchingAds(segment)
      if (jobs.isEmpty) {
        Ok("No jobs") withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        val shuffled = Random.shuffle(jobs)
        JsonComponent {
          "html" -> views.html.jobs(shuffled take 5)
        } withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
