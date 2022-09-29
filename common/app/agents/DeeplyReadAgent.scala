package agents

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment.RenderingFormat
import common._
import contentapi.ContentApiClient
import model.ContentFormat
import model.dotcomrendering.OnwardCollectionResponse
import play.api.libs.json._
import services.{OphanApi, OphanDeeplyReadItem}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import model.dotcomrendering.Trail

import java.lang.Throwable

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  /*
      We use a mutable map instead of a com.gu.Box, as the latter is a minimal wrapper.
      Both are used as key value store providing in memory caching.

      This implies that several EC2 instances running this app couqld be in slightly different states
      at any point in time. This is not an issue as we have our CDN caching layer in front.
   */

  private val deeplyReadItems = Box[Map[Edition, Seq[Trail]]](Map.empty)

  def removeStartingSlash(path: String): String = {
    if (path.startsWith("/")) path.stripPrefix("/") else path
  }

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.info(s"Deeply Read Agent refresh()")
    /*
      We query Ophan for the deeply read URLs and use them to queryCapi
      then use this information to create a sequence of trails that we cache
      using a Box structure.
     */
    Future
      .sequence(Edition.all.map { edition =>
        ophanApi.getDeeplyRead(edition).flatMap {
          ophanDeeplyReadItems =>
            log.info(s"ophanItems updated with: ${ophanDeeplyReadItems.size} new items")
            val constructedTrail: Seq[Future[Trail]] = ophanDeeplyReadItems.map {
              ophanItem =>
                log.info(s"CAPI lookup for Ophan deeply read item: ${ophanItem.toString}")
                val path = removeStartingSlash(ophanItem.path)
                log.info(s"CAPI Lookup for path: $path")
                val capiRequest = contentApiClient
                  .item(path)
                  .showTags("all")
                  .showFields("all")
                  .showReferences("none")
                  .showAtoms("none")
                val trailFromCapiResponse = contentApiClient
                  .getResponse(capiRequest)
                  .map { res =>
                    res.content.flatMap { capiData =>
                      log.info(s"Retrieved CAPI data for Deeply Read item: ${path}")
                      deeplyReadUrlToTrail(capiData)
                    }
                  }
                  .recover {
                    case NonFatal(e) =>
                      log.error(s"Error retrieving CAPI data for Deeply Read item: ${path}. ${e.getMessage}")
                      None
                  }
                trailFromCapiResponse.map(_.get)
            }
            Future.sequence(constructedTrail)
        }
      })
      .map(trailsList => {
//      deeplyReadItems
        val map = Edition.all.zip(trailsList).toMap
        deeplyReadItems.alter(map)
      })
  }

  def correctPillar(pillar: String): String = if (pillar == "arts") "culture" else pillar

  def deeplyReadUrlToTrail(content: Content): Option[Trail] = {

    val contentFormat: ContentFormat = ContentFormat(content.design, content.theme, content.display)

    for {
      webPublicationDate <- content.webPublicationDate
      fields <- content.fields
      linkText <- fields.trailText
      pillar <- content.pillarName
      headline <- fields.headline
      shortUrl <- fields.shortUrl
    } yield Trail(
      url = content.webUrl,
      linkText = linkText,
      showByline = false,
      byline = fields.byline,
      image = fields.thumbnail,
      carouselImages = Map.empty,
      ageWarning = None,
      isLiveBlog = fields.liveBloggingNow.getOrElse(false),
      pillar = correctPillar(pillar.toLowerCase),
      designType = content.`type`.toString,
      format = contentFormat,
      webPublicationDate = webPublicationDate.toString(),
      headline = headline,
      mediaType = None,
      shortUrl = shortUrl,
      kickerText = None,
      starRating = None,
      avatarUrl = None,
      branding = None,
    )
  }

  def getTrails(edition: Edition)(implicit ec: ExecutionContext): Seq[Trail] = {
    val updatedTrails = deeplyReadItems.get().getOrElse(edition, Seq.empty)
    if (updatedTrails.isEmpty) {
      refresh()
    }
    updatedTrails
  }

}
