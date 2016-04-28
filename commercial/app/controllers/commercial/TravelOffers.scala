package controllers.commercial

import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import play.api.mvc._

import scala.concurrent.Future

object TravelOffers extends Controller with implicits.Requests {

  def renderTravel = Action.async { implicit request =>
    Future.successful {
      val travelOffers = (TravelOffersAgent.specificTravelOffers(specificIds) ++
                      TravelOffersAgent.offersTargetedAt(segment)).distinct
      travelOffers.toList match {
        case Nil => NoCache(jsonFormat.nilResult)
        case offers => Cached(componentMaxAge) {
          val clickMacro = request.getParameter("clickMacro")
          val omnitureId = request.getParameter("omnitureId")

          request.getParameter("layout") match {
            case Some("prominent") =>
              jsonFormat.result(views.html.travel.travelProminent(offers.take(4), omnitureId, clickMacro))
            case _ =>
              jsonFormat.result(views.html.travel.travelStandardV2(offers.take(4), omnitureId, clickMacro))
          }
        }
      }
    }
  }

}
