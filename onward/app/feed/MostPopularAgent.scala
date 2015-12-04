package feed

import conf.LiveContentApi
import common._
import services.OphanApi
import play.api.libs.json.{JsArray, JsValue}
import model.RelatedContentItem
import scala.concurrent.duration._
import scala.concurrent.Future
import LiveContentApi.getResponse

object MostPopularAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = agent().get(edition.id).getOrElse(Nil)

  def refresh() {
    log.info("Refreshing most popular.")
    Edition.all foreach refresh
  }

  def refresh(edition: Edition) = getResponse(LiveContentApi.item("/", edition)
      .showMostViewed(true)
    ).map { response =>
      val mostViewed = response.mostViewed map { RelatedContentItem(_) } take 10
      agent.alter{ old =>
        old + (edition.id -> mostViewed)
      }
    }

}

object GeoMostPopularAgent extends Logging with ExecutionContexts {

  private val ophanPopularAgent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  // These are the only country codes (row must be lower-case) passed to us from the fastly service.
  // This allows us to choose carefully the codes that give us the most impact. The trade-off is caching.
  private val countries = Seq("GB", "US", "AU", "CA", "IN", "NG", "row")

  def mostPopular(country: String): Seq[RelatedContentItem] = ophanPopularAgent().get(country).getOrElse(Nil)

  def refresh() {
    log.info("Refreshing most popular for countries.")
    countries foreach update
  }

  def update(countryCode: String) {
    val ophanQuery = OphanApi.getMostRead(hours = 3, count = 10, country = countryCode.toLowerCase)

    ophanQuery.map { ophanResults =>

      // Parse ophan results into a sequence of Content objects.
      val mostRead: Seq[Future[Option[RelatedContentItem]]] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
      } yield {
        getResponse(LiveContentApi.item(urlToContentPath(url), Edition.defaultEdition))
          .map(_.content.map(RelatedContentItem(_)))
          .fallbackTo{
            log.error(s"Error requesting $url")
            Future.successful(None)}
      }

      Future.sequence(mostRead).map { contentSeq =>
        val validContents = contentSeq.flatten
        if (validContents.size > 0) {

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

object DayMostPopularAgent extends Logging with ExecutionContexts {

  private val ophanPopularAgent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq("GB", "US", "AU")

  def mostPopular(country: String): Seq[RelatedContentItem] = ophanPopularAgent().get(country).getOrElse(Nil)

  def refresh() {
    log.info("Refreshing most popular for the day.")
    countries foreach update
  }

  def update(countryCode: String) {
    val ophanQuery = OphanApi.getMostRead(hours = 24, count = 10, country = countryCode)

    ophanQuery.map { ophanResults =>

    // Parse ophan results into a sequence of Content objects.
      val mostRead: Seq[Future[Option[RelatedContentItem]]] = for {
        item: JsValue <- ophanResults.asOpt[JsArray].map(_.value).getOrElse(Nil)
        url <- (item \ "url").asOpt[String]
      } yield {
        getResponse(LiveContentApi.item(urlToContentPath(url), Edition.defaultEdition ))
          .map(_.content.map(RelatedContentItem(_)))
          .fallbackTo{
            log.error(s"Error requesting $url")
            Future.successful(None)}
      }

      Future.sequence(mostRead).map { contentSeq =>
        val validContents = contentSeq.flatten
        if (validContents.size > 0) {

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

object MostPopularExpandableAgent extends Logging with ExecutionContexts {

  private val agent = AkkaAgent[Map[String, Seq[RelatedContentItem]]](Map.empty)

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = agent().get(edition.id).getOrElse(Nil)

  def refresh() {
    log.info("Refreshing most popular.")
    Edition.all foreach { edition =>
      getResponse(LiveContentApi.item("/", edition)
        .showMostViewed(true)
        .showFields("headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount,shortUrl,body")
      ).foreach { response =>
        val mostViewed = response.mostViewed map { RelatedContentItem(_) } take 10
        agent.send{ old =>
          old + (edition.id -> mostViewed)
        }
      }
    }
  }
}
