package commercial.model.merchandise.travel

import commercial.model.Segment
import commercial.model.capi.Keyword
import commercial.model.feeds.{FeedMetaData, ParsedFeed}
import commercial.model.merchandise.{MerchandiseAgent, TravelOffer}
import contentapi.ContentApiClient

import scala.concurrent.{ExecutionContext, Future}

class TravelOffersAgent(contentApiClient: ContentApiClient) extends MerchandiseAgent[TravelOffer] {

  def offersTargetedAt(segment: Segment): Seq[TravelOffer] = {
    val defaultOffers = available.sortBy(_.position).take(4)
    getTargetedMerchandise(segment, defaultOffers)(offer =>
      Keyword.idSuffixesIntersect(segment.context.keywords, offer.keywordIdSuffixes),
    )
  }

  def specificTravelOffers(offerIdStrings: Seq[String]): Seq[TravelOffer] = {
    offerIdStrings flatMap (offerId => available find (_.id == offerId))
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String])(implicit
      executionContext: ExecutionContext,
  ): Future[ParsedFeed[TravelOffer]] = {

    val parsedFeed: Future[ParsedFeed[TravelOffer]] = TravelOffersApi.parseOffers(feedMetaData, feedContent)

    parsedFeed map { offers =>
      updateAvailableMerchandise(offers.contents)
    }

    parsedFeed
  }
}
