package controllers.commercial

import common.JsonComponent
import model.commercial.{Segment, TravelOffer}
import model.commercial.travel.TravelOffersAgent
import model.{Cached, NoCache}
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.duration._

class TravelOffersController(travelOffersAgent: TravelOffersAgent) extends Controller with implicits.Requests {

  private def travelSample(specificIds: Seq[String], segment: Segment): Seq[TravelOffer] =
    (travelOffersAgent.specificTravelOffers(specificIds) ++ travelOffersAgent.offersTargetedAt(segment)).distinct

  def renderTravel = Action { implicit request =>

    travelSample(specificIds, segment) match {
      case Nil => Cached(componentNilMaxAge){ jsonFormat.nilResult }
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

  def getTravel = Action { implicit request =>
    val json = Json.toJson(travelSample(specificIds, segment))
    Cached(60.seconds){
      JsonComponent(json)
    }
  }
}
