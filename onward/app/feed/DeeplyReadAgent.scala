package feed

import contentapi.ContentApiClient
import com.gu.contentapi.client.model.v1.Content
import services.{OphanApi, OphanDeeplyReadItem}
import play.api.libs.json._
import common._
import models._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

/*
  The class DeeplyReadItem is the one that define the answer to the deeply-read.json
  Note that it's different from OphanDeeplyReadItem which is the one we read from the Ophan Api
  DeeplyReadItem is an OnwardItem with also a path and benchmarkedAttentionTime
 */
case class DeeplyReadItem(
    path: String,
    benchmarkedAttentionTime: Int,
    url: String,
    linkText: String,
    showByline: Boolean,
    byline: Option[String],
    image: Option[String],
    ageWarning: Option[String],
    isLiveBlog: Boolean,
    pillar: String,
    designType: String,
    webPublicationDate: String,
    headline: String,
    mediaType: Option[String],
    shortUrl: String,
    kickerText: Option[String],
    starRating: Option[Int],
    avatarUrl: Option[String],
)
object DeeplyReadItem {
  implicit val jsonWrites = Json.writes[DeeplyReadItem]

  def deeplyReadItemToOnwardItemNx2(item: DeeplyReadItem): OnwardItemNx2 = {
    OnwardItemNx2(
      url = item.url,
      linkText = item.linkText,
      showByline = item.showByline,
      byline = item.byline,
      image = item.image,
      ageWarning = item.ageWarning,
      isLiveBlog = item.isLiveBlog,
      pillar = item.pillar,
      designType = item.designType,
      webPublicationDate = item.webPublicationDate,
      headline = item.headline,
      mediaType = item.mediaType,
      shortUrl = item.shortUrl,
      kickerText = item.kickerText,
      starRating = item.starRating,
      avatarUrl = None,
    )
  }
}

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  /*
      This (DeeplyReadAgent) agent is similar in purpose and interface as the ones we already have at the
      time those lines re written, namely MostPopularAgent and its siblings, but there is a difference: we use a
      mutable map instead of a com.gu.Box. In either case they ( mutable map and Boxes ) are essentially used as
      key value store providing in memory caching.

      Note that as for the Box situation, this implies that several EC2 instances running this app, could be in
      slightly different states at any point in time, which is ok, as they converge at each refresh.
   */

  private var deeplyReadItems: scala.collection.mutable.Map[OphanDeeplyReadItem, Content] =
    scala.collection.mutable.Map.empty[OphanDeeplyReadItem, Content]

  def removeStartingSlash(path: String): String = {
    if (path.startsWith("/")) path.stripPrefix("/") else path
  }

  def refresh()(implicit ec: ExecutionContext): Future[Seq[Option[(OphanDeeplyReadItem, Content)]]] = {
    log.info(s"[cb01a845] Deeply Read Agent refresh()")
    /*
        Here we simply go through the OphanDeeplyReadItem we got from Ophan and for each
        query CAPI and set the Content for the path.
     */

    val fDeeplyReadItemsWithCapi: Future[Seq[Option[(OphanDeeplyReadItem, Content)]]] =
      ophanApi.getDeeplyReadContent().flatMap { seq =>
        log.info(s"[cb01a845] ophanItems updated with: ${seq.toArray.size} new items")
        val seqCapiFutures: Seq[Future[Option[(OphanDeeplyReadItem, Content)]]] = seq.map { ophanItem =>
          log.info(s"[cb01a845] CAPI lookup for Ophan deeply read item: ${ophanItem.toString}")
          val path = removeStartingSlash(ophanItem.path)
          log.info(s"[cb01a845] CAPI Lookup for path: ${path}")
          val capiItem = contentApiClient
            .item(path)
            .showTags("all")
            .showFields("all")
            .showReferences("none")
            .showAtoms("none")
          val capiResponse = contentApiClient
            .getResponse(capiItem)
            .map { res =>
              res.content.map { c =>
                log.info(s"[cb01a845] In memory Update CAPI data for path: ${path}")
                println(s"[cb01a845] In memory Update CAPI data for path: ${path}")
                ophanItem -> c
              }
            }
            .recover {
              case NonFatal(e) =>
                log.info(s"[cb01a845] Error CAPI lookup for path: ${path}. ${e.getMessage}")
                None
            }
          capiResponse
        }
        Future.sequence(seqCapiFutures)

      // We now perform the atomic update of deeplyReadItems to faithfully reflects the state of the Ophan answer.
      // It is done as last step of the process because by then the CAPI content has been loaded.
      }
    fDeeplyReadItemsWithCapi.foreach { sequence =>
      val mapDeeplyReadItems = sequence.filter(_.isDefined).map(_.get).toMap
      deeplyReadItems = collection.mutable.Map(mapDeeplyReadItems.toSeq: _*)
    }
    fDeeplyReadItemsWithCapi
  }

  def correctPillar(pillar: String): String = if (pillar == "arts") "culture" else pillar

  def ophanItemToDeeplyReadItem(item: OphanDeeplyReadItem, content: Content): Option[DeeplyReadItem] = {
    // We are doing the pillar correction during the OphanDeeplyReadItem to DeeplyReadItem transformation
    // Note that we could also do it during the DeeplyReadItem to OnwardItemNx2 transformation
    for {
      webPublicationDate <- content.webPublicationDate
      fields <- content.fields
      linkText <- fields.trailText
      pillar <- content.pillarName
      headline <- fields.headline
      shortUrl <- fields.shortUrl
    } yield DeeplyReadItem(
      path = item.path,
      benchmarkedAttentionTime = item.benchmarkedAttentionTime,
      url = content.webUrl,
      linkText = linkText,
      showByline = false,
      byline = fields.byline,
      image = fields.thumbnail,
      ageWarning = None,
      isLiveBlog = fields.liveBloggingNow.getOrElse(false),
      pillar = correctPillar(pillar.toLowerCase),
      designType = content.`type`.toString,
      webPublicationDate = webPublicationDate.toString(),
      headline = headline,
      mediaType = None,
      shortUrl = shortUrl,
      kickerText = None,
      starRating = None,
      avatarUrl = None,
    )
  }

  def getReport()(implicit ec: ExecutionContext): Seq[DeeplyReadItem] = {
    if (deeplyReadItems.isEmpty) {
      // This helps improving the situation if the initial akka driven refresh failed (which happens way to often)
      // Note that is there was no data in ophanItems the report will be empty, but will at least return data at the next call
      log.info(s"[cb01a845] refresh() from getReport()")
      refresh()
    }
    deeplyReadItems
      .map(Function.tupled(ophanItemToDeeplyReadItem))
      .filter(_.isDefined)
      .map(_.get) // Note that it is safe to call .get here because we have filtered on .isDefined before
      .toSeq
  }
}
