package feed

import com.gu.contentapi.client.model.v1.Content
import common._
import contentapi.ContentApiClient
import model.RelatedContentItem
import services.OphanApi

import scala.concurrent.{ExecutionContext, Future}

case class Country(code: String, edition: Edition)

class MostPopularAgent(contentApiClient: ContentApiClient) extends GuLogging {

  private val relatedContentsBox = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private def refresh(edition: Edition)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {

    val mostViewedQuery = contentApiClient
      .item("/", edition)
      .showMostViewed(true)

    val futureMostViewed = contentApiClient.getResponse(mostViewedQuery)

    for {
      mostViewedResponse <- futureMostViewed
      mostViewed = mostViewedResponse.mostViewed.getOrElse(Nil).take(10).map(RelatedContentItem(_)).toSeq
      newMap <- relatedContentsBox.alter(_ + (edition.id -> mostViewed))
    } yield newMap
  }

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = relatedContentsBox().getOrElse(edition.id, Nil)

  // Note that here we are in procedural land here (not functional)
  def refresh()(implicit ec: ExecutionContext): Unit = {
    MostViewed.refreshAll(Edition.allEditions)(refresh)
  }
}

class GeoMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  private val box = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val defaultCountry: Country = Country("row", Edition.defaultEdition)

  // These are the only country codes (row must be lower-case) passed to us from the fastly service.
  // This allows us to choose carefully the codes that give us the most impact. The trade-off is caching.
  private val countries = Seq(
    Country("GB", editions.Uk),
    Country("US", editions.Us),
    Country("AU", editions.Au),
    Country("CA", editions.Us),
    Country("IN", Edition.defaultEdition),
    Country("NG", Edition.defaultEdition),
    Country("NZ", editions.Au),
    defaultCountry,
  )

  private def refresh(country: Country)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 3, count = 10, country = country.code.toLowerCase)
    MostViewed.relatedContentItems(ophanMostViewed, country.edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.nonEmpty) {
        log.info(s"Geo popular ${country.code} updated successfully.")
      } else {
        log.info(s"Geo popular update for ${country.code} found nothing.")
      }
      box.alter(_ + (country.code -> validItems))
    }
  }

  def mostPopular(country: String): Seq[RelatedContentItem] =
    box().getOrElse(country, box().getOrElse(defaultCountry.code, Nil))

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular for countries.")
    MostViewed.refreshAll(countries)(refresh)
  }
}

class DayMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  private val box = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq(
    Country("GB", editions.Uk),
    Country("US", editions.Us),
    Country("AU", editions.Au),
  )

  def mostPopular(country: String): Seq[RelatedContentItem] = box().getOrElse(country, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular for the day.")
    MostViewed.refreshAll(countries)(refresh)
  }

  def refresh(country: Country)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 24, count = 10, country = country.code.toLowerCase())
    MostViewed.relatedContentItems(ophanMostViewed, country.edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.isEmpty) {
        log.info(s"Day popular update for ${country.code} found nothing.")
      }
      box.alter(_ + (country.code -> validItems))
    }
  }
}
