package model.commercial.travel

import commercial.feeds.{FeedMetaData, ParsedFeed}
import common.ExecutionContexts
import contentapi.ContentApiClient
import model.commercial.{Keyword, Lookup, MerchandiseAgent, Segment, TravelOffer}

import scala.concurrent.Future

class TravelOffersAgent(contentApiClient: ContentApiClient) extends MerchandiseAgent[TravelOffer] with ExecutionContexts {

  private val lookup = new Lookup(contentApiClient)

  def offersTargetedAt(segment: Segment): Seq[TravelOffer] = {
    val defaultOffers = available.sortBy(_.position).take(4)
    getTargetedMerchandise(segment, defaultOffers)(offer =>
      Keyword.idSuffixesIntersect(segment.context.keywords, offer.keywordIdSuffixes))
  }

  def specificTravelOffers(offerIdStrings: Seq[String]): Seq[TravelOffer] = {
    offerIdStrings flatMap (offerId => available find (_.id == offerId))
  }

  def refresh(feedMetaData: FeedMetaData, feedContent: => Option[String]): Future[ParsedFeed[TravelOffer]] = {

    def fetchKeywords(country: String): Future[Seq[String]] = for {
      keywords <- lookup.keyword("\"" + country + "\"", section = Some("travel"))
    } yield keywords.map(_.id).distinct

    def keywordsForOffer(offer: TravelOffer): Future[Seq[String]] = Future.sequence(offer.countries.map(fetchKeywords)).map(_.flatten)

    def addKeywords(offers: Seq[TravelOffer]): Future[Seq[TravelOffer]] = {

      val populated = Future.sequence {
        offers.map { offer =>
          keywordsForOffer(offer).map { keywords =>
            offer.copy(keywordIdSuffixes = keywords map Keyword.getIdSuffix)
          }
        }
      }

      populated.onSuccess { case offers =>
        val unpopulated = offers
          .withFilter(_.keywordIdSuffixes.isEmpty)
          .map { offer =>
            offer.title + ": countries(" + offer.countries.mkString + ")"
          }.mkString("; ")
        log.info(s"No keywords for these offers: $unpopulated")
      }

      populated
    }

    val parsedFeed: Future[ParsedFeed[TravelOffer]] = for {
      feed <- TravelOffersApi.parseOffers(feedMetaData, feedContent)
      withKeywords <- addKeywords(feed.contents)
    } yield feed.copy(contents = withKeywords)

    parsedFeed map { offers =>
      updateAvailableMerchandise(offers.contents)
    }

    parsedFeed
  }
}
