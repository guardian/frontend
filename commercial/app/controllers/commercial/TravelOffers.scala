package controllers.commercial

import model.commercial.travel.{TravelOffer, TravelOffersAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import scala.concurrent.Future

object TravelOffers extends Controller {

  object lowRelevance extends Relevance[TravelOffer] {
    def view(offers: Seq[TravelOffer])(implicit request: RequestHeader) = views.html.travelOffers(offers)
  }
  object lowRelevanceV2 extends Relevance[TravelOffer] {
    def view(offers: Seq[TravelOffer])(implicit request: RequestHeader) = views.html.travelOffersV2(offers)
  }

  object highRelevance extends Relevance[TravelOffer] {
    def view(offers: Seq[TravelOffer])(implicit request: RequestHeader) = views.html.travelOffersHigh(offers)
  }
  object highRelevanceV2 extends Relevance[TravelOffer] {
    def view(offers: Seq[TravelOffer])(implicit request: RequestHeader) = views.html.travelOffersHighV2(offers)
  }

  private def renderTravelOffers(relevance: Relevance[TravelOffer], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        (TravelOffersAgent.specificTravelOffers(specificIds) ++ TravelOffersAgent.adsTargetedAt(segment)).distinct match {
          case Nil => NoCache(format.nilResult)
          case offers => Cached(componentMaxAge) {
            format.result(relevance.view(offers take 4))
          }
        }
      }
    }

  def travelOffersLowHtml = renderTravelOffers(lowRelevance, htmlFormat)
  def travelOffersLowJson = renderTravelOffers(lowRelevance, jsonFormat)
  def travelOffersLowJsonV2 = renderTravelOffers(lowRelevanceV2, jsonFormat)

  def travelOffersHighHtml = renderTravelOffers(highRelevance, htmlFormat)
  def travelOffersHighJson = renderTravelOffers(highRelevance, jsonFormat)
  def travelOffersHighJsonV2 = renderTravelOffers(highRelevanceV2, jsonFormat)
}
