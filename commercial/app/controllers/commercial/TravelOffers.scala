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
      val keywords = request.queryString.get("k")
      val offers = keywords map (OffersAgent.offers(_)) getOrElse OffersAgent.allOffers
      if (offers.size > 1) {
        Ok(views.html.fragments.travelOffer(offers(0), offers(1))) withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        Ok("No offers") withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
