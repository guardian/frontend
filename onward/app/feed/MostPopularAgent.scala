package feed

import com.gu.Box
import com.gu.contentapi.client.model.v1.Content
import common._
import contentapi.ContentApiClient
import model.{MegaSlotMeta, RelatedContentItem}
import play.api.libs.json._
import play.api.libs.ws.WSClient
import services.{OphanApi, S3Megaslot}
import conf.Configuration

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

  def mostPopular(edition: Edition): Seq[RelatedContentItem] = agent().getOrElse(edition.id, Nil)

  def refresh()(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] = {
    log.info("Refreshing most popular.")
    MostPopularRefresh.all(Edition.all)(refresh)
  }

  private def refresh(edition: Edition)(implicit ec: ExecutionContext): Future[Map[String, Seq[RelatedContentItem]]] =
    contentApiClient.getResponse(contentApiClient.item("/", edition)
      .showMostViewed(true)
    ).flatMap { response =>
      val mostViewed = response.mostViewed.getOrElse(Nil).take(10).map(RelatedContentItem(_))
      agent.alter(_ + (edition.id -> mostViewed))
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

case class MegaSlot(
  headline: String,
  uk: Content,
  us: Content,
  au: Content,
  row: Content
)

object MegaSlot extends Logging {
  def get(client: ContentApiClient, key: String)(implicit ec: ExecutionContext): Future[MegaSlot] = {
    S3Megaslot.get(key).flatMap(asMeta) match {
      case Some(m) => {
        log.info(s"Megaslot - got meta $m")
        val res = populateFromCAPI(client, m)
        res.onComplete(r => log.info(s"Popular from CAPI gave:\n\n $r"))
        res
      }
      case None => Future.failed(throw new NoSuchElementException("JSON not found or invalid"))
    }
  }

  private[this] def asMeta(blob: String): Option[MegaSlotMeta] = {
    val meta = Json.parse(blob).asOpt[MegaSlotMeta]
    if (meta.isEmpty) {
      log.info(s"Megaslot - unable to read JSON, received: $blob")
    }
    meta
  }

  private[this] def populateFromCAPI(client: ContentApiClient, meta: MegaSlotMeta)(implicit ec: ExecutionContext): Future[MegaSlot] = {
    val idsParam = s"${meta.uk},${meta.au},${meta.us},${meta.row}"
    val query = client.search.ids(idsParam).showFields("all").showTags("all")

    for {
      response <- client.getResponse(query)
    } yield {
      val models = response.results.map(c => c.id -> c).toMap
      MegaSlot(
        headline = meta.headline,
        uk = models(meta.uk),
        us = models(meta.us),
        au = models(meta.au),
        row = models(meta.row)
      )
    }
  }
}

class OnSocialAgent(val contentApiClient: ContentApiClient) extends Logging {
  private[this] val agent = Box[Option[MegaSlot]](None)

  def getHeadline: String = agent.get.map(_.headline).getOrElse("")

  def get(edition: Edition): Option[Content] = {
    agent.get.flatMap { megaSlot =>
      edition match {
        case editions.Uk => Some(megaSlot.uk)
        case editions.Us => Some(megaSlot.us)
        case editions.Au => Some(megaSlot.au)
        case editions.International => Some(megaSlot.row)
        case _ => None
      }
    }
  }

  def refresh()(implicit ec: ExecutionContext): Future[MegaSlot] = {
    val ms = MegaSlot.get(contentApiClient, "on-social.json")
    ms.foreach(slot => agent.alter(Some(slot)))
    ms
  }
}

class MostCommentedAgent(val contentApiClient: ContentApiClient, wsClient: WSClient) extends Logging {
  private[this] val agent = Box[Option[MegaSlot]](None)
  private[this] val commentCounts = Box[Map[String, Int]](Map.empty)
  private[this] val dapiURL = Configuration.discussion.apiRoot

  def getHeadline: String = agent.get.map(_.headline).getOrElse("")

  def get(edition: Edition): Option[(Content, Int)] = {
    def commentCount(c: Content): Option[(Content, Int)] = {
      val surl = shortUrl(c)
      commentCounts.get.get(surl) match {
        case Some(count) =>
          Some(c -> count)
        case None =>
          log.info(s"Megaslot - unable to find comment count for content ${c.id}. Short URL was $surl.")
          None
      }
    }

    agent.get.flatMap { megaSlot =>
      edition match {
        case editions.Uk => commentCount(megaSlot.uk)
        case editions.Us => commentCount(megaSlot.us)
        case editions.Au => commentCount(megaSlot.au)
        case editions.International => commentCount(megaSlot.row)
        case _ => {
          log.info(s"Megaslot - unable to find most commented for edition ${edition.id} in ${commentCounts}")
          None
        }
      }
    }
  }

  def refresh()(implicit ec: ExecutionContext): Future[MegaSlot] = {
    val ms = MegaSlot.get(contentApiClient, "most-commented.json")

    ms.foreach { slot =>
      agent.alter(Some(slot))
      val params = List(shortUrl(slot.uk), shortUrl(slot.us), shortUrl(slot.au), shortUrl(slot.row))
          .map("short-urls" -> _)

      val countsURL = s"$dapiURL/getCommentCounts"
      val response = wsClient
        .url(countsURL)
        .addQueryStringParameters(params: _*)
        .get()

      val counts = response.flatMap(r => {
        r.json.asOpt[Map[String, Int]] match {
          case Some(m) => Future.successful(m)
          case None => Future.failed(throw new NoSuchElementException("JSON not found or invalid"))
        }
      })

      counts.foreach(commentCounts.alter)
    }
    ms
  }

  private[this] def shortUrl(c: Content) = c.fields.flatMap(_.shortUrl).map(_.stripPrefix("https://gu.com")).getOrElse("")

}
