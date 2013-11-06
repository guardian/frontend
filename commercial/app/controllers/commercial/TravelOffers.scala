package controllers.commercial

import play.api.mvc._
import common.ExecutionContexts
import model.commercial.travel.OffersAgent
import model.commercial.Segment

object TravelOffers extends Controller with ExecutionContexts {

  def listOffers = Action {
    implicit request =>

      def expectedParam(paramName: String): Seq[String] = request.queryString.get(paramName) getOrElse Nil

      val segment = Segment(expectedParam("k"), expectedParam("seg"))
      val offers = OffersAgent.offers(segment)
      if (offers.size > 1) {
        val view = views.html.fragments.travelOffer(offers)
        Ok(view) withHeaders ("Cache-Control" -> "max-age=60")
      } else {
        Ok("No offers") withHeaders ("Cache-Control" -> "max-age=60")
      }
  }

}
