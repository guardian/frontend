package commercial.controllers

import commercial.model.Segment
import commercial.model.merchandise.travel.TravelOffersAgent
import common.JsonComponent
import model.Cached
import commercial.model.merchandise.TravelOffer
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.duration._

class TravelOffersController(travelOffersAgent: TravelOffersAgent, val controllerComponents: ControllerComponents)
    extends BaseController
    with implicits.Requests {

  private def travelSample(specificIds: Seq[String], segment: Segment): Seq[TravelOffer] =
    (travelOffersAgent.specificTravelOffers(specificIds) ++ travelOffersAgent.offersTargetedAt(segment)).distinct

  def getTravel: Action[AnyContent] =
    Action { implicit request =>
      Cached(60.seconds) {
        JsonComponent.fromWritable(travelSample(specificIds, segment))
      }
    }
}
