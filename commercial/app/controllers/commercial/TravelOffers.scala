package controllers.commercial

import play.api.mvc._
import model.commercial.travel.OffersAgent

object TravelOffers extends CommercialComponentController {

  def listOffers = Action {
    implicit request =>
      val offers = OffersAgent.matchingAds(segment)
      if (offers.size > 1) {
        val view = views.html.fragments.travelOffer(offers)
        Ok(view) withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        Ok("No offers") withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
