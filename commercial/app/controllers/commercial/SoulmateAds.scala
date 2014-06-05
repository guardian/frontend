package controllers.commercial

import common.{JsonNotFound, JsonComponent}
import model.Cached
import model.commercial.soulmates._
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object SoulmateAds extends Controller {

  def renderAds = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => NotFound
        case members => Cached(componentMaxAge)(Ok(views.html.soulmates(members)))
      }
    }
  }

  def mixed = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => JsonNotFound.apply()
        case members => Cached(componentMaxAge)(JsonComponent(views.html.soulmates(members)))
      }
    }
  }

  def renderAdsHigh = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => NotFound
        case members => Cached(componentMaxAge)(Ok(views.html.soulmatesHigh(members)))
      }
    }
  }

  def mixedHigh = MemcachedAction { implicit request =>
    Future.successful {
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => JsonNotFound.apply()
        case members => Cached(componentMaxAge)(JsonComponent(views.html.soulmatesHigh(members)))
      }
    }
  }

}
