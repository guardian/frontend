package agents

import conf.Configuration
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.Content
import common._
import feed.{AU, CA, GB, US, NG, NZ, IN, ROW, Country, MostViewed}
import services.OphanApi
import model.RelatedContentItem
import play.api.libs.json._
import play.api.libs.ws.WSClient

import java.net.URL
import scala.concurrent.{ExecutionContext, Future}

class MostViewedAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi, wsClient: WSClient) extends GuLogging {

  private val mostViewedBox = Box[Map[Country, Seq[RelatedContentItem]]](Map.empty)
  private val mostCommentedCardBox = Box[Option[Content]](None)
  private val mostSharedCardBox = Box[Option[Content]](None)

  // todo: better typing for country codes
  def mostViewed(country: Country): Seq[RelatedContentItem] = mostViewedBox().getOrElse(country, Nil)
  def mostCommented = mostCommentedCardBox.get()
  def mostShared = mostSharedCardBox.get()

  // Helper case class to read from the most/comments discussion API call.
  private case class MostDiscussedItem(key: String, url: String, numberOfComments: Int) {
    def isLiveBlog: Boolean = url.contains("/live/")
  }

  private object MostDiscussedItem {
    implicit val format = Json.format[MostDiscussedItem]
  }

  private def refreshGlobal()(implicit ec: ExecutionContext): Future[(Option[Content],Option[Content])] = {

    log.info("Pulling most social media shared from Ophan")

    val sinceHours = 3
    val sinceTimestamp = System.currentTimeMillis - sinceHours * 60 * 60 * 1000

    val futureMostFaceBook = ophanApi.getMostReadFacebook(sinceHours)
    val futureMostCommented = mostCommented(wsClient, sinceTimestamp)

    for {
      mostFacebook <- futureMostFaceBook
      oneFacebookMostRead = mostFacebook.headOption.get
      oneFacebookContent <- contentFromUrl(oneFacebookMostRead.url, contentApiClient)
      mostSharedContent <- mostSharedCardBox.alter(Some(oneFacebookContent))

      oneMostCommentedItem <- futureMostCommented
      oneMostCommentedContent <- contentFromUrl(oneMostCommentedItem.url, contentApiClient)
      mostCommentedContent <- mostCommentedCardBox.alter(Some(oneMostCommentedContent))
    } yield (mostSharedContent, mostCommentedContent)
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
      mostViewedBox.alter(_ + (country -> validItems))
    }
  }

  // Note that here we are in procedural land here (not functional)
  def refresh()(implicit ec: ExecutionContext): Future[(Option[Content], Option[Content])] = {
    MostViewed.refreshAll(countries)(refresh)
    refreshGlobal()
  }
}
