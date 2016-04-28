package controllers.commercial

import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import play.api.mvc._

object TravelOffersController extends Controller with implicits.Requests {

  def renderTravel = Action { implicit request =>
    val travelOffers =
      (TravelOffersAgent.specificTravelOffers(specificIds) ++ TravelOffersAgent.offersTargetedAt(segment)).distinct
    travelOffers match {
      case Nil => NoCache(jsonFormat.nilResult)
      case offers => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")
        jsonFormat.result(views.html.travel.travelStandard(offers.take(4), omnitureId, clickMacro))
      }
    }
  }
}
