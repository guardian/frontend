package controllers.commercial

import play.api.mvc._
import model.commercial.jobs.JobsAgent
import common.{JsonNotFound, JsonComponent}
import model.Cached

object JobAds extends Controller {

  implicit val codec = Codec.utf_8

  def jobs = Action {
    implicit request =>
      JobsAgent.adsTargetedAt(segment) match {
        case Nil => JsonNotFound.apply()
        case jobs => {
          Cached(60)(JsonComponent(views.html.jobs(jobs take 5)).as(JSON))
        }
      }
  }
}
