package controllers.commercial

import model.commercial.travel.{Offer, OffersAgent}
import model.{NoCache, Cached}
import performance.MemcachedAction
import play.api.mvc._
import play.api.templates.Html
import scala.concurrent.Future

object TravelOffers extends Controller {

  object lowRelevance extends Relevance[Offer] {
    def view(offers: Seq[Offer])(implicit request: RequestHeader): Html = views.html.travelOffers(offers)
  }

  object highRelevance extends Relevance[Offer] {
    def view(offers: Seq[Offer])(implicit request: RequestHeader): Html = views.html.travelOffersHigh(offers)
  }

  private def renderTravelOffers(relevance: Relevance[Offer], format: Format) =
    MemcachedAction { implicit request =>
      Future.successful {
        OffersAgent.adsTargetedAt(segment) match {
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
