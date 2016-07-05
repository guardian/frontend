package controllers.commercial

import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import play.api.mvc._

class TravelOffersController extends Controller with implicits.Requests {

  def renderTravel = Action { implicit request =>

    val travelOffers =
      (TravelOffersAgent.specificTravelOffers(specificIds) ++ TravelOffersAgent.offersTargetedAt(segment)).distinct

    travelOffers match {
      case Nil => NoCache(jsonFormat.nilResult.result)
      case offers => Cached(componentMaxAge) {
        val clickMacro = request.getParameter("clickMacro")
        val omnitureId = request.getParameter("omnitureId")

        request.getParameter("layout") match {
          case Some("prominent") =>
            jsonFormat.result(views.html.travel.travel(offers.take(3), omnitureId, clickMacro, isProminent = true))
          case _ =>
            jsonFormat.result(views.html.travel.travel(offers.take(4), omnitureId, clickMacro))
        }

      }
    }
  }
}
object TravelOffersController extends TravelOffersController
