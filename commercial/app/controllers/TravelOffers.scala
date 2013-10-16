package controllers

import play.api.mvc._
import common.ExecutionContexts
import model.travel.service.OffersAgent

object TravelOffers extends Controller with ExecutionContexts {

  def refresh = Action {
    implicit request =>
      OffersAgent.refresh()
      Ok("OK")
  }

  def listOffers = Action {
    implicit request =>
      Ok(OffersAgent.allOffers mkString "\n")
  }

}
