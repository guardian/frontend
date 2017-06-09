package feed

import com.gu.commercial.branding.{Branding, BrandingFinder}
import contentapi.{ContentApiClient, QueryDefaults}
import common._
import services.OphanApi
import model.RelatedContentItem
import scala.concurrent.{ExecutionContext, Future}

class MostPopularAgent(contentApiClient: ContentApiClient) extends Logging {

  private val agent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = agent().getOrElse(edition.id, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[List[Map[String, Seq[RelatedContentItem]]]] = {
    log.info("Refreshing most popular.")
    Future.sequence(Edition.all.map(refresh))
  }

  private def refresh(edition: Edition)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] =
    contentApiClient.getResponse(contentApiClient.item("/", edition)
      .showMostViewed(true)
    ).flatMap { response =>
      val mostViewed = response.mostViewed.getOrElse(Nil).take(10).map { RelatedContentItem(_) }
      agent.alter{ old =>
        old + (edition.id -> mostViewed)
      }
    }

}

class GeoMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val ophanPopularAgent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val MaxMostRead: Int = 10

  // These are the only country codes (row must be lower-case) passed to us from the fastly service.
  // This allows us to choose carefully the codes that give us the most impact. The trade-off is caching.
  private val countries = Seq("GB", "US", "AU", "CA", "IN", "NG", "NZ", "row")

  // Default country if the country does is not currently populated
  private val defaultCountry: String = "row"

  def mostPopular(country: String): Seq[RelatedContentItem] =
    ophanPopularAgent().getOrElse(country, ophanPopularAgent().getOrElse(defaultCountry, Nil)).take(MaxMostRead)

  def refresh()(implicit ec: ExecutionContext): Future[Seq[Map[String, Seq[RelatedContentItem]]]] = {
    log.info("Refreshing most popular for countries.")
    Future.sequence(countries.map(refresh))
  }

  private def refresh(countryCode: String)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 3, count = 10, country = countryCode.toLowerCase)
    MostViewed.relatedContentItems(ophanMostViewed)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.nonEmpty) {
        log.info(s"Geo popular $countryCode updated successfully.")
      } else {
        log.info(s"Geo popular update for $countryCode found nothing.")
      }
      ophanPopularAgent.alter(_ + (countryCode -> validItems))
    }
  }
}

class DayMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val ophanPopularAgent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq("GB", "US", "AU")

  def mostPopular(country: String): Seq[RelatedContentItem] = ophanPopularAgent().getOrElse(country, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Seq[Map[String, Seq[RelatedContentItem]]]] = {
    log.info("Refreshing most popular for the day.")
    Future.sequence(countries.map(update))
  }

  def update(countryCode: String)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 24, count = 10, country = countryCode)
    MostViewed.relatedContentItems(ophanMostViewed)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.isEmpty) {
        log.info(s"Day popular update for $countryCode found nothing.")
      }
      ophanPopularAgent.alter(_ + (countryCode -> validItems))
    }
  }
}
