package feed

import com.gu.Box
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.{Content, ContentType}
import common._
import services.OphanApi
import model.RelatedContentItem

import scala.concurrent.{ExecutionContext, Future}

object MostPopularRefresh {

  def all[A](as: Seq[A])
            (refreshOne: A => Future[Map[String, Seq[RelatedContentItem]]])
            (implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    as.map(refreshOne)
      .reduce( (itemsF, otherItemsF) =>
        for {
          items <- itemsF
          otherItems <- otherItemsF
        } yield items ++ otherItems
      )
  }
}

class MostPopularAgent(contentApiClient: ContentApiClient) extends Logging {

  private val agent = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  // Container for most_shared and most_commented
  val mostSingleCards = Box[Map[String,Content]](Map.empty)

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = agent().getOrElse(edition.id, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most shared, commented and popular.")
    // Note that here we're not in pure functional land here.
    refreshGlobal()
    MostPopularRefresh.all(Edition.all)(refresh)
  }

  private def refreshGlobal()(implicit ec: ExecutionContext): Future[Map[String,Content]] = {
    val mostShared: Content = Content.apply("most_shared_id", ContentType.Article, Some("some_section"), Some("Some Section"),
      None, "Most Shared Web Title" , "/most_shared_web_url" , "most_shared_api_url" )
    val mostCommented: Content = mostShared

    log.info("Setting Most shared and most viewed")

    mostSingleCards.alter( _ + ( "most_shared" -> mostShared ) + ( "most_commented" -> mostCommented ))
  }

  private def refresh(edition: Edition)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {

    val mostViewedQuery = contentApiClient.item("/", edition)
      .showMostViewed(true)

    val futureMostViewed = contentApiClient.getResponse(mostViewedQuery)

    for {
      mostViewedResponse <- futureMostViewed

      mostViewed = mostViewedResponse.mostViewed.getOrElse(Nil).take(10).map(RelatedContentItem(_))
      newMap <- agent.alter(_ + (edition.id -> mostViewed) )
    } yield newMap
  }
}

case class Country(code: String, edition: Edition)

class GeoMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val ophanPopularAgent = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

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
    defaultCountry
  )

  def mostPopular(country: String): Seq[RelatedContentItem] =
    ophanPopularAgent().getOrElse(country, ophanPopularAgent().getOrElse(defaultCountry.code, Nil))

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular for countries.")
    MostPopularRefresh.all(countries)(refresh)
  }

  private def refresh(country: Country)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 3, count = 10, country = country.code.toLowerCase)
    MostViewed.relatedContentItems(ophanMostViewed, country.edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.nonEmpty) {
        log.info(s"Geo popular ${country.code} updated successfully.")
      } else {
        log.info(s"Geo popular update for ${country.code} found nothing.")
      }
      ophanPopularAgent.alter(_ + (country.code -> validItems))
    }
  }
}

class DayMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val ophanPopularAgent = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq(
    Country("GB", editions.Uk),
    Country("US", editions.Us),
    Country("AU", editions.Au)
  )

  def mostPopular(country: String): Seq[RelatedContentItem] = ophanPopularAgent().getOrElse(country, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular for the day.")
    MostPopularRefresh.all(countries)(refresh)
  }

  def refresh(country: Country)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 24, count = 10, country = country.code.toLowerCase())
    MostViewed.relatedContentItems(ophanMostViewed, country.edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.isEmpty) {
        log.info(s"Day popular update for ${country.code} found nothing.")
      }
      ophanPopularAgent.alter(_ + (country.code -> validItems))
    }
  }
}
