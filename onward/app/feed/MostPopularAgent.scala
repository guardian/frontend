package feed

import com.gu.commercial.branding.{Branding, BrandingFinder}
import contentapi.ContentApiClient
import common._
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}
import model.RelatedContentItem
import scala.concurrent.Future
import scala.util.control.NonFatal

class MostPopularAgent(contentApiClient: ContentApiClient) extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = agent().getOrElse(edition.id, Nil)

  def refresh() {
    log.info("Refreshing most popular.")
    Edition.all foreach refresh
  }

  def refresh(edition: Edition) = contentApiClient.getResponse(contentApiClient.item("/", edition)
      .showMostViewed(true)
    ).map { response =>
      val mostViewed = response.mostViewed.getOrElse(Nil) take 10 map { RelatedContentItem(_) }
      agent.alter{ old =>
        old + (edition.id -> mostViewed)
      }
    }

}

class GeoMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging with ExecutionContexts {

  private val ophanPopularAgent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  // These are the only country codes (row must be lower-case) passed to us from the fastly service.
  // This allows us to choose carefully the codes that give us the most impact. The trade-off is caching.
  private val countries = Seq("GB", "US", "AU", "CA", "IN", "NG", "NZ", "row")

  // Default country if the country does is not currently populated
  private val defaultCountry: String = "row"

  def mostPopular(country: String): Seq[RelatedContentItem] =
    ophanPopularAgent().getOrElse(country, ophanPopularAgent().getOrElse(defaultCountry, Nil))

  def refresh(): Unit = {
    log.info("Refreshing most popular for countries.")
    countries foreach update
  }

  def update(countryCode: String) {
    val ophanQuery: Future[JsValue] = ophanApi.getMostRead(hours = 3, count = 12, country = countryCode.toLowerCase)
    val edition: Edition = Edition.byId(countryCode).getOrElse(Edition.defaultEdition)

    ophanQuery.map { ophanResults =>

      // Parse ophan results into a sequence of Content objects.
      val mostRead: Seq[Future[Option[RelatedContentItem]]] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
      } yield {
        contentApiClient
          .getResponse(contentApiClient
            .item(urlToContentPath(url), edition)
            .showTags("paid-content")
            .showSection(true)
            .showFields("isInappropriateForSponsorship"))
          .map(_.content
            .filterNot { content => BrandingFinder.findBranding(countryCode)(content).exists(_.isPaid)}
            .map(RelatedContentItem(_)))
          .recover {
            case NonFatal(e)  =>
              log.error(s"Error requesting $url", e)
              None
          }
      }

      Future.sequence(mostRead).map { contentSeq =>
        val validContents = contentSeq.flatten
        if (validContents.nonEmpty) {

          // Add each country code to the map.
          ophanPopularAgent send ( currentMap => {
            currentMap + (countryCode -> contentSeq.flatten)
          })

          log.info(s"Geo popular $countryCode updated successfully.")

        } else {

          log.info(s"Geo popular update for $countryCode found nothing.")
        }
      }
    }
  }
}

class DayMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging with ExecutionContexts {

  private val ophanPopularAgent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq("GB", "US", "AU")

  def mostPopular(country: String): Seq[RelatedContentItem] = ophanPopularAgent().getOrElse(country, Nil)

  def refresh() {
    log.info("Refreshing most popular for the day.")
    countries foreach update
  }

  def update(countryCode: String) {
    val ophanQuery = ophanApi.getMostRead(hours = 24, count = 10, country = countryCode)

    ophanQuery.map { ophanResults =>

    // Parse ophan results into a sequence of Content objects.
      val mostRead: Seq[Future[Option[RelatedContentItem]]] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
      } yield {
        contentApiClient.getResponse(contentApiClient.item(urlToContentPath(url), Edition.defaultEdition ))
          .map(_.content.map(RelatedContentItem(_)))
          .recover {
            case NonFatal(e) =>
              log.error(s"Error requesting $url", e)
              None
          }
      }

      Future.sequence(mostRead).map { contentSeq =>
        val validContents = contentSeq.flatten
        if (validContents.nonEmpty) {

          // Add each country code to the map.
          ophanPopularAgent send ( currentMap => {
            currentMap + (countryCode -> contentSeq.flatten)
          })

        } else {

          log.info(s"Day popular update for $countryCode found nothing.")
        }
      }
    }
  }
}
