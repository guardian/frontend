package controllers.commercial

import play.api.mvc._
import model.commercial.travel.OffersAgent
import common.{JsonComponent, ExecutionContexts}

object TravelOffers extends Controller with ExecutionContexts with ExpectsSegmentInRequests {

  def listOffers = Action {
    implicit request =>
      val offers = OffersAgent.matchingAds(segment)
      if (offers.isEmpty) {
        noMatchingSegmentsResult
      } else {
        JsonComponent {
          views.html.fragments.travelOffer(offers)
        } withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
