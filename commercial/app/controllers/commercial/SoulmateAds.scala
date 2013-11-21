package controllers.commercial

import play.api.mvc._
import common.{JsonNotFound, JsonComponent}
import model.commercial.soulmates._
import model.Cached

object SoulmateAds extends Controller {

  def mixed = Action {
    implicit request =>
      SoulmatesAggregatingAgent.sampleMembers(segment) match {
        case Nil => JsonNotFound.apply()
        case members => {
          Cached(60)(JsonComponent(views.html.soulmates(members)))
        }
      }
  }
}
