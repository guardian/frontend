package controllers.commercial

import common.{JsonNotFound, JsonComponent}
import model.Cached
import model.commercial.jobs.JobsAgent
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object JobAds extends Controller {

  implicit val codec = Codec.utf_8

  def renderAds = MemcachedAction { implicit request =>
    Future.successful {
      JobsAgent.adsTargetedAt(segment) match {
        case Nil => NotFound
        case jobs => Cached(componentMaxAge)(Ok(views.html.jobs(jobs take 2)))
      }
    }
  }

  def jobs = MemcachedAction { implicit request =>
    Future.successful {
      JobsAgent.adsTargetedAt(segment) match {
        case Nil => JsonNotFound.apply()
        case jobs => Cached(componentMaxAge)(JsonComponent(views.html.jobs(jobs take 2)))
      }
    }
  }

  def renderAdsHigh = MemcachedAction { implicit request =>
    Future.successful {
      JobsAgent.adsTargetedAt(segment) match {
        case Nil => NotFound
        case jobs => Cached(componentMaxAge)(Ok(views.html.jobsHigh(jobs take 2)))
      }
    }
  }

  def jobsHigh = MemcachedAction { implicit request =>
    Future.successful {
      JobsAgent.adsTargetedAt(segment) match {
        case Nil => JsonNotFound.apply()
        case jobs => Cached(componentMaxAge)(JsonComponent(views.html.jobsHigh(jobs take 2)))
      }
    }
  }
}
