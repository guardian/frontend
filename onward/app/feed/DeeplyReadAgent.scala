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

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends Logging {

  /*
      This (DeeplyReadAgent) agent is similar in purpose and interface as the ones we already have at the
      time those lines re written, namely MostPopularAgent and its siblings, but there is a difference: we use a
      mutable map instead of a com.gu.Box. In either case they ( mutable map and Boxes ) are essentially used as
      key value store providing in memory caching.

      Note that as for the Box situation, this implies that several EC2 instances running this app, could be in
      slightly different states at any point in time, which is ok, as they converge at each refresh.
   */

  private var ophanItems: Array[OphanDeeplyReadItem] = Array.empty[OphanDeeplyReadItem]
  private val pathToCapiContentMapping: scala.collection.mutable.Map[String, Content] =
    scala.collection.mutable.Map.empty[String, Content]

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info(s"[cb01a845] Deeply Read Agent refresh()")
    /*
        Here we simply go through the OphanDeeplyReadItem we got from Ophan and for each
        query CAPI and set the Content for the path.
     */

    ophanApi.getDeeplyReadContent().map { seq =>
      // This is where the atomic update of ophanItems which faithfully reflects the state of the Ophan answer
      ophanItems = seq.toArray
      log.info(s"[cb01a845] ophanItems updated with: ${seq.toArray.size} new items")

      seq.foreach { ophanItem =>
        log.info(s"[cb01a845] CAPI lookup for Ophan deeply read item: ${ophanItem.toString}")
        val path = ophanItem.path
        log.info(s"[cb01a845] CAPI Lookup for path: ${path}")
        val capiItem = contentApiClient
          .item(path)
          .showTags("all")
          .showFields("all")
          .showReferences("all")
          .showAtoms("all")
        val fx = contentApiClient
          .getResponse(capiItem)
          .map { res =>
            res.content.map { c =>
              println(s"[cb01a845] In memory Update CAPI data for path: ${path}")
              log.info(s"[cb01a845] In memory Update CAPI data for path: ${path}")
              pathToCapiContentMapping += (path -> c) // update the Content for a given map
            }
          }
          .recover {
            case NonFatal(e) =>
              println(s"[cb01a845] Error CAPI lookup for path :${path}. ${e.getMessage}")
              log.info(s"[cb01a845] Error CAPI lookup for path: ${path}. ${e.getMessage}")
              None
          }
        Await.ready(fx, Duration(2000, "millis"))
        Thread.sleep(1000)
      }
    }
  }

  def getDataForPath(path: String): Option[Content] = {
    /*
        This function returns any stored CAPI Content for a path, thereby making the link between the path read from
        a OphanDeeplyReadItem and a DeeplyReadItem (from the corresponding Content).

        we use this function instead of accessing mapping directly to abstract the logic away from the Map implementation
     */
    pathToCapiContentMapping.get(path)
  }

  def ophanItemToDeeplyReadItem(item: OphanDeeplyReadItem): Option[DeeplyReadItem] = {
    for {
      content <- getDataForPath(item.path)
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
      isLiveBlog = true,
      pillar = pillar,
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
    if (pathToCapiContentMapping.keys.isEmpty || (pathToCapiContentMapping.keys.size < ophanItems.size)) {
      println("refresh() from getReport()")
      refresh() // This help improving the situation if the initial akka driven refresh failed (which happens way to often)
    }
    ophanItems
      .map(ophanItemToDeeplyReadItem)
      .filter(_.isDefined)
      .map(_.get) // Note that it is safe to call .get here because we have filtered on .isDefined before
  }
}
