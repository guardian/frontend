package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts
import model.commercial.travel.OffersAgent

object TravelOffers extends Controller with ExecutionContexts {

  def refresh = Action {
    implicit request =>
      OffersAgent.refresh()
      Ok("OK") withHeaders ("Cache-Control" -> "max-age=0")
  }

  def listOffers = Action {
    implicit request =>
      Ok(OffersAgent.allOffers mkString "\n") withHeaders ("Cache-Control" -> "max-age=0")
  }

}
