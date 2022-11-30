package agents

import conf.Configuration
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.Content
import common._
import common.editions.{Au, Europe, International, Uk, Us}
import feed.MostViewed
import services.OphanApi
import model.RelatedContentItem
import play.api.libs.json._
import play.api.libs.ws.WSClient

import scala.concurrent.{ExecutionContext, Future}

class MostViewedAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi, wsClient: WSClient) extends GuLogging {

  private val mostViewedBox = Box[Map[Edition, Seq[RelatedContentItem]]](Map.empty)
  private val mostCommentedCardBox = Box[Option[Content]](None)
  private val mostSharedCardBox = Box[Option[Content]](None)

  // todo: better typing for country codes
  def mostViewed(edition: Edition): Seq[RelatedContentItem] =
    mostViewedBox().getOrElse(edition, Nil)
  def mostCommented = mostCommentedCardBox.get()
  def mostShared = mostSharedCardBox.get()

  // Helper case class to read from the most/comments discussion API call.
  private case class MostDiscussedItem(key: String, url: String, numberOfComments: Int) {
    def isLiveBlog: Boolean = url.contains("/live/")
  }

  private object MostDiscussedItem {
    implicit val format = Json.format[MostDiscussedItem]
  }

  private def refreshGlobal()(implicit ec: ExecutionContext): Future[(Option[Content], Option[Content])] = {

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

  private def refresh(
      edition: Edition,
  )(implicit ec: ExecutionContext): Future[Map[Edition, Seq[RelatedContentItem]]] = {
    val countryCode = edition match {
      case Uk            => "gb"
      case Us            => "us"
      case Au            => "au"
      case International => "international" // todo: check this
      case Europe        => "international"
    }
    val ophanMostViewed = ophanApi.getMostRead(hours = 3, count = 10, country = countryCode)
    MostViewed.relatedContentItems(ophanMostViewed, edition)(contentApiClient).flatMap { items =>
      val validItems = items.flatten
      if (validItems.nonEmpty) {
        log.info(s"Geo popular ${countryCode} updated successfully.")
      } else {
        log.info(s"Geo popular update for ${countryCode} found nothing.")
      }
      mostViewedBox.alter(_ + (edition -> validItems))
    }
  }

  // Note that here we are in procedural land here (not functional)
  def refresh()(implicit ec: ExecutionContext): Future[(Option[Content], Option[Content])] = {
    MostViewed.refreshAll(Edition.allWithBetaEditions)(refresh)
    refreshGlobal()
  }
}
