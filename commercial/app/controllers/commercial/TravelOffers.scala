package controllers.commercial

import model.commercial.travel.{TravelOffer, TravelOffersAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object TravelOffers extends Controller with implicits.Requests {

  object lowRelevance extends Relevance[TravelOffer] {
    def view(offers: Seq[TravelOffer])(implicit request: RequestHeader) = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.travelOffers(offers, omnitureId, clickMacro)
    }
  }

  object highRelevance extends Relevance[TravelOffer] {
    def view(offers: Seq[TravelOffer])(implicit request: RequestHeader) = {
      val clickMacro = request.getParameter("clickMacro")
      val omnitureId = request.getParameter("omnitureId")
      views.html.travelOffersHigh(offers, omnitureId, clickMacro)
    }
  }

  private def renderTravelOffers(relevance: Relevance[TravelOffer], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        (TravelOffersAgent.specificTravelOffers(specificIds) ++ TravelOffersAgent.offersTargetedAt(segment)).distinct match {
          case Nil => NoCache(format.nilResult)
          case offers => Cached(componentMaxAge) {
            format.result(relevance.view(offers take 4))
          }
        }
      }
    }

  def travelOffersLowHtml = renderTravelOffers(lowRelevance, htmlFormat)
  def travelOffersLowJson = renderTravelOffers(lowRelevance, jsonFormat)

  def travelOffersHighHtml = renderTravelOffers(highRelevance, htmlFormat)
  def travelOffersHighJson = renderTravelOffers(highRelevance, jsonFormat)
}
