package agents

import com.gu.contentapi.client.model.v1.Content
import com.gu.contentapi.client.utils.CapiModelEnrichment.RenderingFormat
import common._
import contentapi.ContentApiClient
import model.ContentFormat
import model.dotcomrendering.{OnwardCollectionResponse}
import play.api.libs.json._
import services.{OphanApi, OphanDeeplyReadItem}

import scala.concurrent.{ExecutionContext, Future}
import scala.util.control.NonFatal
import model.dotcomrendering.Trail

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  /*
      We use a mutable map instead of a com.gu.Box, as the latter is a minimal wrapper.
      Both are used as key value store providing in memory caching.

      This implies that several EC2 instances running this app could be in slightly different states
      at any point in time. This is not an issue as we have our CDN caching layer in front.
   */

  private var deeplyReadItems = Box[Map[Edition, Seq[Trail]]](Map.empty)

  def removeStartingSlash(path: String): String = {
    if (path.startsWith("/")) path.stripPrefix("/") else path
  }

  def refresh(edition: Edition)(implicit ec: ExecutionContext): Future[Seq[Trail]] = {
    log.info(s"Deeply Read Agent refresh()")
    /*
        Here we simply go through the OphanDeeplyReadItem we got from Ophan and for each
        query CAPI and set the Content for the path.
     */

    val deeplyReadItemsWithCapi: Future[Seq[Option[Option[model.dotcomrendering.Trail]]]] =
      ophanApi.getDeeplyRead(edition).flatMap { seq =>
        log.info(s"ophanItems updated with: ${seq.toArray.size} new items")
        val constructedTrail: Seq[Future[Option[Option[model.dotcomrendering.Trail]]]] = seq.map { ophanItem =>
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
                ophanItemToTrail(ophanItem, c)
              }
            }
            .recover {
              case NonFatal(e) =>
                log.info(s"Error CAPI lookup for path: ${path}. ${e.getMessage}")
                None
            }
          capiResponse
        }
        Future.sequence(constructedTrail)
      }

    val futureTrailSequence: Future[Seq[Trail]] = deeplyReadItemsWithCapi.map { seq =>
      seq.flatten.flatten
    }

    deeplyReadItemsWithCapi.foreach { sequence =>
      val trailSequence = sequence.filter(option => option.filter(_.isDefined).isDefined).map(_.get.get)
      val deeplyReadMap = Map(edition -> trailSequence)

      deeplyReadItems.alter(deeplyReadMap)
    }

    futureTrailSequence
  }

  def correctPillar(pillar: String): String = if (pillar == "arts") "culture" else pillar

  def ophanItemToTrail(item: OphanDeeplyReadItem, content: Content): Option[Trail] = {

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
      carouselImages = ???,
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
      branding = ???,
    )
  }

  def getReport(edition: Edition)(implicit ec: ExecutionContext): OnwardCollectionResponse = {
    if (deeplyReadItems().isEmpty) {
      // This helps improving the situation if the initial akka driven refresh failed (which happens way to often)
      // Note that is there was no data in ophanItems the report will be empty, but will at least return data at the next call
      log.info(s"refresh() from getReport()")
      refresh(edition)
    }

    val trails: Seq[Trail] = getTrailsOnly(edition)
    OnwardCollectionResponse("Deeply read", trails)
  }

  def getTrailsOnly(edition: Edition)(implicit ec: ExecutionContext): Seq[Trail] = {
    if (deeplyReadItems().isEmpty) {
      refresh(edition)
    }

    deeplyReadItems().get(edition).getOrElse(Seq.empty)
  }

}
