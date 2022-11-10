package feed

import conf.Configuration
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.Content
import common._
import services.{OphanApi}
import model.RelatedContentItem
import play.api.libs.json._
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}

class MostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi, wsClient: WSClient) extends GuLogging {

  private val relatedContentsBox = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  // Container for most_shared and most_commented
  val mostSingleCardsBox = Box[Map[String, Content]](Map.empty)

  // Helper case class to read from the most/comments discussion API call.
  private case class MostDiscussedItem(key: String, url: String, numberOfComments: Int) {
    def isLiveBlog: Boolean = url.contains("/live/")
  }

  private object MostDiscussedItem {
    implicit val format = Json.format[MostDiscussedItem]
  }

  private def refreshGlobal()(implicit ec: ExecutionContext): Future[Map[String, Content]] = {

    log.info("Pulling most social media shared from Ophan")

    val sinceHours = 3
    val sinceTimestamp = System.currentTimeMillis - sinceHours * 60 * 60 * 1000

    val futureMostFaceBook = ophanApi.getMostReadFacebook(sinceHours)
    val futureMostCommented = mostCommented(wsClient, sinceTimestamp)

    for {
      mostFacebook <- futureMostFaceBook
      oneFacebookMostRead = mostFacebook.headOption.get
      oneFacebookContent <- contentFromUrl(oneFacebookMostRead.url, contentApiClient)
      _ <- mostSingleCardsBox.alter(_ + ("most_shared" -> oneFacebookContent))

      oneMostCommentedItem <- futureMostCommented
      oneMostCommentedContent <- contentFromUrl(oneMostCommentedItem.url, contentApiClient)
      newMap <- mostSingleCardsBox.alter(_ + ("most_commented" -> oneMostCommentedContent))
    } yield newMap
  }

  private def mostCommented(wsClient: WSClient, since: Long)(implicit
      ec: ExecutionContext,
  ): Future[MostDiscussedItem] = {
    val dapiURL = Configuration.discussion.apiRoot
    val params = List("api-key" -> "dotcom", "pageSize" -> "10", "sinceTimestamp" -> since.toString)

    val fResponse = wsClient
      .url(dapiURL + "/most/comments")
      .addQueryStringParameters(params: _*)
      .get()

    fResponse.map { r =>
      val json = r.json
      (json \ "discussions").as[List[MostDiscussedItem]].filterNot { _.isLiveBlog }.head
    }
  }

  private def contentFromUrl(url: String, capi: ContentApiClient)(implicit ec: ExecutionContext): Future[Content] = {
    capi
      .getResponse(capi.item(MostViewed.urlToContentPath(url), ""))
      .map { itemResponse =>
        itemResponse.content.get
      }
  }

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
    MostViewed.refreshAll(Edition.allWithBetaEditions)(refresh)
    refreshGlobal()
  }
}

class GeoMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  private val box = Box[Map[Country, Seq[RelatedContentItem]]](Map.empty)

  // These are the only country codes passed to us from the fastly service.
  // This allows us to choose carefully the codes that give us the most impact. The trade-off is caching.
  private val countries = Seq(
    GB, US, CA, AU, NG, NZ, IN, ROW
  )

  private def refresh(country: Country)(implicit ec: ExecutionContext): Future[Map[Country, Seq[RelatedContentItem]]] = {
    val ophanMostViewed = ophanApi.getMostRead(hours = 3, count = 10, country = country.code.toLowerCase)
    MostViewed.relatedContentItems(ophanMostViewed, country.edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.nonEmpty) {
        log.info(s"Geo popular ${country.code} updated successfully.")
      } else {
        log.info(s"Geo popular update for ${country.code} found nothing.")
      }
      box.alter(_ + (country -> validItems))
    }
  }

  def mostPopular(country: Country): Seq[RelatedContentItem] =
    box().getOrElse(country, Nil) // todo: I've changed the fallback here because we've changed the typing, but is this right?

  def refresh()(implicit ec: ExecutionContext): Future[Map[Country, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular for countries.")
    MostViewed.refreshAll(countries)(refresh)
  }
}

class DayMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  private val box = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq(
    GB, US, AU
  )
  def mostPopular(country: String): Seq[RelatedContentItem] = box().getOrElse(country, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Map[Country, Seq[RelatedContentItem]]] = {
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
