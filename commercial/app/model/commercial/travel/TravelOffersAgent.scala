package model.commercial.travel

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.ExecutionContexts
import model.commercial.{Keyword, MerchandiseAgent, Segment}

import scala.concurrent.Future

object TravelOffersAgent extends MerchandiseAgent[TravelOffer] with ExecutionContexts {

  def offersTargetedAt(segment: Segment): Seq[TravelOffer] = {
    val defaultOffers = available.sortBy(_.position).take(4)
    getTargetedMerchandise(segment, defaultOffers)(offer =>
      Keyword.idSuffixesIntersect(segment.context.keywords, offer.keywordIdSuffixes))
  }

  def specificTravelOffers(offerIdStrings: Seq[String]): Seq[TravelOffer] = {

    def sortByRequestOrder(a: TravelOffer, b: TravelOffer) = {

      def getOriginalPositionOfId(offer: TravelOffer) = offerIdStrings.indexOf(offer.id)
      getOriginalPositionOfId(a) < getOriginalPositionOfId(b)
    }

    available filter (offer => offerIdStrings contains offer.id) sortWith sortByRequestOrder
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[TravelOffer]] = {

    def populateKeywords(offers: Seq[TravelOffer]) = {
      val populated = offers map {
        offer =>
          val offerKeywordIds = offer.countries.flatMap(Countries.forCountry).distinct
          offer.copy(keywordIdSuffixes = offerKeywordIds map Keyword.getIdSuffix)
      }

      val unpopulated = populated.withFilter(_.keywordIdSuffixes.isEmpty).map {
        offer => offer.title + ": countries(" + offer.countries.mkString + ")"
      }.mkString("; ")
      log.info(s"No keywords for these offers: $unpopulated")

      populated
    }

    val parsedFeed: Future[ParsedFeed[TravelOffer]] = {
      TravelOffersApi.parseOffers(feedMetaData, feedContent) map { feed =>
        feed.copy(contents = populateKeywords(feed.contents))
      }
    }

    parsedFeed map { offers =>
      updateAvailableMerchandise(offers.contents)
    }

    parsedFeed
  }
}
