package controllers.commercial

import play.api.mvc._
import scala.util.Random
import model.commercial.jobs.{LightJobsAgent, JobsAgent}
import common.{JsonNotFound, JsonComponent}
import model.Cached

object JobAds extends Controller {

  def jobs = Action {
    implicit request =>
      JobsAgent.matchingAds(segment) match {
        case Nil => JsonNotFound.apply()
        case jobs => {
          val shuffled = Random.shuffle(jobs)
          Cached(60)(JsonComponent(views.html.jobs(shuffled take 5)))
        }
      }
  }

  // New light jobs feed available only in dev env
  def lightJobs = Action {
    implicit request =>
      LightJobsAgent.matchingAds(segment) match {
        case Nil => JsonNotFound.apply()
        case jobs => {
          val shuffled = Random.shuffle(jobs)
          Cached(60)(JsonComponent(views.html.lightjobs(shuffled take 5)))
        }
      }
  }

}
