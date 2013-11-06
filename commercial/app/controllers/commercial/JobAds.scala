package controllers.commercial

import play.api.mvc._
import scala.util.Random
import model.commercial.jobs.JobsAgent

object JobAds extends CommercialComponentController {

  def jobs = Action {
    implicit request =>
      val jobs = JobsAgent.matchingAds(segment)
      if (jobs.isEmpty) {
        Ok("No jobs") withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        val shuffled = Random.shuffle(jobs)
        val view = views.html.jobs(shuffled take 5)
        Ok(view) withHeaders ("Cache-Control" -> "max-age=60")
      }
  }
}
