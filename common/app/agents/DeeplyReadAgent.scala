package agents

import agents.DeeplyReadItem.deeplyReadItemToOnwardItem
import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment.RenderingFormat
import common._
import contentapi.ContentApiClient
import model.ContentFormat
import model.dotcomrendering.{OnwardCollectionResponse, OnwardItem}
import play.api.libs.json._
import services.{OphanApi, OphanDeeplyReadItem}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal

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
    format: Option[ContentFormat],
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

  def deeplyReadItemToOnwardItem(item: DeeplyReadItem): OnwardItem = {
    OnwardItem(
      url = item.url,
      linkText = item.linkText,
      showByline = item.showByline,
      byline = item.byline,
      image = item.image,
      carouselImages = Map("N/A" -> None), // Not implemented for Deeply Read at the moment
      ageWarning = item.ageWarning,
      isLiveBlog = item.isLiveBlog,
      pillar = item.pillar,
      designType = item.designType,
      format = item.format.getOrElse(ContentFormat.defaultContentFormat),
      webPublicationDate = item.webPublicationDate,
      headline = item.headline,
      mediaType = item.mediaType,
      shortUrl = item.shortUrl,
      kickerText = item.kickerText,
      starRating = item.starRating,
      avatarUrl = None,
      branding = None,
    )
  }
}

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  /*
      We use a mutable map instead of a com.gu.Box, as the latter is a minimal wrapper.
      Both are used as key value store providing in memory caching.

      This implies that several EC2 instances running this app could be in slightly different states
      at any point in time. This is not an issue as we have our CDN caching layer in front.
   */

  private var deeplyReadItems = Box[Map[OphanDeeplyReadItem, Content]](Map.empty)

  def removeStartingSlash(path: String): String = {
    if (path.startsWith("/")) path.stripPrefix("/") else path
  }

  def refresh()(implicit ec: ExecutionContext): Future[Seq[Option[(OphanDeeplyReadItem, Content)]]] = {
    log.info(s"Deeply Read Agent refresh()")
    /*
        Here we simply go through the OphanDeeplyReadItem we got from Ophan and for each
        query CAPI and set the Content for the path.
     */

    val deeplyReadItemsWithCapi: Future[Seq[Option[(OphanDeeplyReadItem, Content)]]] =
      ophanApi.getDeeplyRead().flatMap { seq =>
        log.info(s"ophanItems updated with: ${seq.toArray.size} new items")
        val eventualMaybeTuples: Seq[Future[Option[(OphanDeeplyReadItem, Content)]]] = seq.map { ophanItem =>
          log.info(s"CAPI lookup for Ophan deeply read item: ${ophanItem.toString}")
          val path = removeStartingSlash(ophanItem.path)
          log.info(s"CAPI Lookup for path: ${path}")
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
                log.info(s"Update CAPI data for path: ${path}")
                println(s"Update CAPI data for path: ${path}")
                ophanItem -> c
              }
            }
            .recover {
              case NonFatal(e) =>
                log.info(s"Error CAPI lookup for path: ${path}. ${e.getMessage}")
                None
            }
          capiResponse
        }
        Future.sequence(eventualMaybeTuples)

      // We now perform the atomic update of deeplyReadItems to faithfully reflects the state of the Ophan answer.
      // It is done as last step of the process because by then the CAPI content has been loaded.
      }
    deeplyReadItemsWithCapi.foreach { sequence =>
      val mapDeeplyReadItems = sequence.filter(_.isDefined).map(_.get).toMap
      deeplyReadItems.alter(mapDeeplyReadItems)
    }
    deeplyReadItemsWithCapi
  }

  def correctPillar(pillar: String): String = if (pillar == "arts") "culture" else pillar

  def ophanItemToDeeplyReadItem(item: OphanDeeplyReadItem, content: Content): Option[DeeplyReadItem] = {

    val contentFormat: ContentFormat = ContentFormat(content.design, content.theme, content.display)

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
      format = Some(contentFormat),
      webPublicationDate = webPublicationDate.toString(),
      headline = headline,
      mediaType = None,
      shortUrl = shortUrl,
      kickerText = None,
      starRating = None,
      avatarUrl = None,
    )
  }

  def getReport()(implicit ec: ExecutionContext): OnwardCollectionResponse = {
    if (deeplyReadItems().isEmpty) {
      // This helps improving the situation if the initial akka driven refresh failed (which happens way to often)
      // Note that is there was no data in ophanItems the report will be empty, but will at least return data at the next call
      log.info(s"refresh() from getReport()")
      refresh()
    }

    val trails: Seq[OnwardItem] = deeplyReadItems()
      .flatMap(t => ophanItemToDeeplyReadItem(t._1, t._2))
      .map(deeplyReadItemToOnwardItem)
      .toSeq

    OnwardCollectionResponse("Deeply read", trails)

  }
}
