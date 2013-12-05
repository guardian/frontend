package model.commercial.travel

import common.{ExecutionContexts, Logging}
import model.commercial.{Segment, AdAgent}

object OffersAgent extends AdAgent[Offer] {

  def refresh() {
    AllOffersAgent.refresh()
    MostPopularOffersAgent.refresh()
  }

  override def adsTargetedAt(segment: Segment, adsToChooseFrom: Seq[Offer] = AllOffersAgent.currentAds): Seq[Offer] = {
    val matchingOffers = AllOffersAgent.adsTargetedAt(segment, adsToChooseFrom)
    if (matchingOffers.isEmpty) {
      MostPopularOffersAgent.currentAds
    }
    else matchingOffers
  }
}

object AllOffersAgent extends AdAgent[Offer] with Logging with ExecutionContexts {

  def refresh() = {
    for {offers <- OffersApi.getAllOffers}
    yield updateCurrentAds(populateKeywords(offers))
  }

  private def populateKeywords(offers: Seq[Offer]) = {
    val populated = offers map {
      offer =>
        val offerKeywords = offer.countries.flatMap(Countries.forCountry).distinct
        offer.copy(keywords = offerKeywords)
    }

    val unpopulated = populated.withFilter(_.keywords.isEmpty).map {
      offer => offer.title.getOrElse("Untitled") + ": countries(" + offer.countries.mkString + ")"
    }.mkString("; ")
    log.info(s"No keywords for these offers: $unpopulated")

    populated
  }
}

object MostPopularOffersAgent extends AdAgent[Offer] with ExecutionContexts {

  def refresh() {
    OffersApi.getMostPopularOffers map updateCurrentAds
  }
}
