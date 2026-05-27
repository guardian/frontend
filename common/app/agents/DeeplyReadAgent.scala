package agents

import com.gu.contentapi.client.model.v1.{Content, ElementType}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RenderingFormat
import common._
import conf.Configuration
import contentapi.ContentApiClient
import layout.DiscussionSettings
import model.ContentFormat
import services.{FaciaContentConvert, OphanApi, S3}

import scala.concurrent.{ExecutionContext, Future}
import model.dotcomrendering.Trail
import play.api.libs.json.Json


object DeeplyReadS3Agent extends S3 {
  override lazy val bucket = Configuration.cache.bucket;
  lazy val stage: String = Configuration.environment.stage.toUpperCase
}

class DeeplyReadAgent(contentApiClient: ContentApiClient, ophanApi: OphanApi) extends GuLogging {

  private val deeplyReadItems = Box[Map[Edition, Seq[Trail]]](Map.empty)

  def removeStartingSlash(path: String): String = {
    if (path.startsWith("/")) path.stripPrefix("/") else path
  }

  def refresh()(implicit ec: ExecutionContext): Future[Unit] = {
    log.debug(s"Deeply Read Agent refresh()")
    /*
      We query Ophan for the deeply read URLs and use them to queryCapi
      then use this information to create a sequence of trails that we cache
      using a Box structure.
     */
    Future
      .sequence(Edition.allEditions.map { edition =>
        // TODO make s3.get async
        DeeplyReadS3Agent.get(s"${DeeplyReadS3Agent.stage}/deeply-read/${edition.id.toLowerCase()}.json") match {
          case Some(jsonTrail) =>
            Json.parse(jsonTrail).asOpt[Trail]
        }
//          .recover { e =>
//            log.error(s"Failed to fetch Deeply Read items for ${edition.displayName}. ${e.getMessage()}")
//            (edition, Seq.empty)
//          }
      })
      .map(trailsList => {
        val map = trailsList.toMap
        for {
          (edition, list) <- map
        } yield log.debug(s"Deeply Read in ${edition.displayName}, ${list.size} items: ${list.map(_.url).toString()}")

        val mapWithTenItems = map.filter { case (_, list) => list.size == 10 }
        log.debug(
          s"Updating the following ${mapWithTenItems.size} editions: ${mapWithTenItems.keys.map(_.id).toList.sorted.toString()}",
        )

        deeplyReadItems.alter(deeplyReadItems.get() ++ mapWithTenItems)
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
      masterImage = None,
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
      discussion = DiscussionSettings.fromTrail(FaciaContentConvert.contentToFaciaContent(content)),
      trailText = content.fields.flatMap(_.trailText),
      galleryCount =
        content.elements.map(_.count(el => el.`type` == ElementType.Image && el.relation == "gallery")).filter(_ > 0),
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
