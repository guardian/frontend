package model.commercial.travel

import common.{ExecutionContexts, Logging}
import model.commercial.AdAgent

object OffersAgent extends AdAgent[Offer] with Logging with ExecutionContexts {

  // most popular Travel Offers
  override def defaultAds = currentAds.sortBy(_.position).take(4)

  def refresh() = {
    for {offers <- OffersApi.loadAds()}
    yield updateCurrentAds(populateKeywords(offers))
  }

  private def populateKeywords(offers: Seq[Offer]) = {
    val populated = offers map {
      offer =>
        val offerKeywords = offer.countries.flatMap(Countries.forCountry).distinct
        offer.copy(keywords = offerKeywords)
    }

    val unpopulated = populated.withFilter(_.keywords.isEmpty).map {
      offer => offer.title + ": countries(" + offer.countries.mkString + ")"
    }.mkString("; ")
    log.info(s"No keywords for these offers: $unpopulated")

    populated
  }
}
