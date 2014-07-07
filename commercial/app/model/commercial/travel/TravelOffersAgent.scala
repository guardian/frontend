package model.commercial.travel

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent

object TravelOffersAgent extends AdAgent[TravelOffer] with Logging with ExecutionContexts {

  // most popular Travel Offers
  override def defaultAds = currentAds.sortBy(_.position).take(4)

  def specificTravelOffers(offerIdStrings: Seq[String]): Seq[TravelOffer] = {
    val offerIds = offerIdStrings map (_.toInt)
    currentAds filter (offer => offerIds contains offer.id)
  }

  def refresh() = {
    for {offers <- TravelOffersApi.loadAds()}
    yield updateCurrentAds(populateKeywords(offers))
  }

  private def populateKeywords(offers: Seq[TravelOffer]) = {
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
}
