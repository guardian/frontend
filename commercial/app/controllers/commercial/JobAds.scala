package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts
import scala.util.Random
import model.commercial.jobs.JobsAgent

object JobAds extends Controller with ExecutionContexts {

  def jobs = Action {
    implicit request =>
      val jobs = request.queryString.get("k") map {
        keywords => JobsAgent.jobs(keywords)
      } getOrElse Nil

      if (jobs.isEmpty) {
        Ok("No jobs") withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        val shuffled = Random.shuffle(jobs)
        val view = views.html.jobs(shuffled take 5)
        Ok(view) withHeaders ("Cache-Control" -> "max-age=60")
      }
  }
}
