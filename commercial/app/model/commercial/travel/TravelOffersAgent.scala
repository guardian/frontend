package model.commercial.travel

import common.ExecutionContexts
import model.commercial.{MerchandiseAgent, Segment, keywordsMatch}

import scala.concurrent.Future

object TravelOffersAgent extends MerchandiseAgent[TravelOffer] with ExecutionContexts {

  def offersTargetedAt(segment: Segment): Seq[TravelOffer] = {
    val defaultOffers = available.sortBy(_.position).take(4)
    getTargetedMerchandise(segment, defaultOffers)(offer => keywordsMatch(segment, offer.keywordIds))
  }

  def specificTravelOffers(offerIdStrings: Seq[String]): Seq[TravelOffer] = {
    val offerIds = offerIdStrings map (_.toInt)
    available filter (offer => offerIds contains offer.id)
  }

  def refresh(): Future[Future[Seq[TravelOffer]]] = {

    def populateKeywords(offers: Seq[TravelOffer]) = {
      val populated = offers map {
        offer =>
          val offerKeywordIds = offer.countries.flatMap(Countries.forCountry).distinct
          offer.copy(keywordIds = offerKeywordIds)
      }

      val unpopulated = populated.withFilter(_.keywordIds.isEmpty).map {
        offer => offer.title + ": countries(" + offer.countries.mkString + ")"
      }.mkString("; ")
      log.info(s"No keywords for these offers: $unpopulated")

      populated
    }

    TravelOffersApi.loadAds() map { offers =>
      updateAvailableMerchandise(populateKeywords(offers))
    }
  }

}
