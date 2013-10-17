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
      val allOffers = OffersAgent.allOffers
      val offers = request.queryString.get("k").map {
        keywords => allOffers.filter {
          offer => (keywords.map(_.toLowerCase).toSet & offer.keywords.map(_.name.toLowerCase).toSet).size > 0
        }
      }.getOrElse(allOffers)
      Ok(views.html.fragments.travelOffer(offers(0), offers(1))) withHeaders ("Cache-Control" -> "max-age=60")
  }

}
