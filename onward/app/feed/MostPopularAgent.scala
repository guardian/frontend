package feed

import com.gu.Box
import conf.Configuration
import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.{Content, ContentFields, ContentType}
import common._
import services.{CAPILookup, OphanApi, OphanDeeplyReadItem, OphanMostReadItem}
import model.RelatedContentItem
import play.api.libs.json._
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.{ExecutionContext, Future}

case class Country(code: String, edition: Edition)

object MostPopularRefresh {

  // This function takes a sequence of items and a function that maps each item to a future.
  // Each future carries a map, all the maps are collapsed into one using a reduce
  def refreshAll[A](as: Seq[A])(
      refreshOne: A => Future[Map[String, Seq[RelatedContentItem]]],
  )(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    as.map(refreshOne)
      .reduce((itemsF, otherItemsF) =>
        for {
          items <- itemsF
          otherItems <- otherItemsF
        } yield items ++ otherItems,
      )
  }
}

class MostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi, wsClient: WSClient) extends Logging {

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
      .getResponse(capi.item(urlToContentPath(url), ""))
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
      mostViewed = mostViewedResponse.mostViewed.getOrElse(Nil).take(10).map(RelatedContentItem(_))
      newMap <- relatedContentsBox.alter(_ + (edition.id -> mostViewed))
    } yield newMap
  }

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = relatedContentsBox().getOrElse(edition.id, Nil)

  // Note that here we are in procedural land here (not functional)
  def refresh()(implicit ec: ExecutionContext): Unit = {
    MostPopularRefresh.refreshAll(Edition.all)(refresh)
    refreshGlobal()
  }
}

class GeoMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

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
    MostPopularRefresh.refreshAll(countries)(refresh)
  }
}

class DayMostPopularAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  private val box = Box[Map[String, Seq[RelatedContentItem]]](Map.empty)

  private val countries = Seq(
    Country("GB", editions.Uk),
    Country("US", editions.Us),
    Country("AU", editions.Au),
  )

  def mostPopular(country: String): Seq[RelatedContentItem] = box().getOrElse(country, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular for the day.")
    MostPopularRefresh.refreshAll(countries)(refresh)
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

case class DeeplyReadItem(
    path: String,
    benchmarkedAttentionTime: Int,
    url: String,
    linkText: String,
    showByline: Boolean,
    byline: String,
    image: String,
    isLiveBlog: Boolean,
    pillar: String,
    designType: String,
    webPublicationDate: String,
    headline: String,
    shortUrl: String,
)
object DeeplyReadItem {
  implicit val jsonWrites = Json.writes[DeeplyReadItem]
}

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) {

  private val mapping: scala.collection.mutable.Map[String, Content] =
    scala.collection.mutable.Map.empty[String, Content]

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    ophanApi.getDeeplyReadContent().map { seq =>
      seq.foreach { i =>
        val path = i.path
        println(s"Looking up data for path: ${path}")
        val capiItem = contentApiClient
          .item(path)
          .showTags("all")
          .showFields("all")
          .showReferences("all")
          .showAtoms("all")
        contentApiClient
          .getResponse(capiItem)
          .map { res =>
            res.content.map { c =>
              mapping += (path -> c)
            }
          }
      }
    }
    Future.successful(())
  }

  def getDataForPath(path: String): Option[Content] = {
    mapping.get(path)
  }

  def getDeeplyReadItemForOphanItem(item: OphanDeeplyReadItem): Option[DeeplyReadItem] = {
    for {
      content <- getDataForPath(item.path)
      webPublicationDate <- content.webPublicationDate
    } yield DeeplyReadItem(
      path = item.path,
      benchmarkedAttentionTime = item.benchmarkedAttentionTime,
      url = content.webUrl,
      linkText = "Brexit: No 10 refuses to commit to agreeing with EU's new no-deal contingency plan – live updates",
      showByline = false,
      byline = "Andrew Sparrow",
      image =
        "https://i.guim.co.uk/img/media/aa9685c6ddfa64e1844bee8d39c5d09864ef93c2/0_122_6048_3628/master/6048.jpg?width=300&quality=85&auto=format&fit=max&s=3f734551601ba14c590fdda3726c2334",
      isLiveBlog = true,
      pillar = "news",
      designType = "Live",
      webPublicationDate = webPublicationDate.toString(),
      headline = "Brexit: No 10 refuses to commit to agreeing with EU's new no-deal contingency plan – live updates",
      shortUrl = "https://gu.com/p/fyzj7",
    )
  }
}
