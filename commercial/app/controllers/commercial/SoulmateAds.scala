package controllers.commercial

import play.api.mvc._
import common.{JsonNotFound, JsonComponent}
import model.commercial.soulmates._
import model.Cached

object SoulmateAds extends Controller {

  def renderAds = Action {
    implicit request =>
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => NotFound
        case members => {
          Cached(60)(Ok(views.html.soulmates(members)))
        }
      }
  }

  def mixed = Action {
    implicit request =>
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => JsonNotFound.apply()
        case members => {
          Cached(60)(JsonComponent(views.html.soulmates(members)))
        }
      }
  }

  def renderAdsHigh = Action {
    implicit request =>
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => NotFound
        case members => {
          Cached(60)(Ok(views.html.soulmatesHigh(members)))
        }
      }
  }

  def mixedHigh = Action {
    implicit request =>
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => JsonNotFound.apply()
        case members => {
          Cached(60)(JsonComponent(views.html.soulmatesHigh(members)))
        }
      }
  }

}
