package frontpress

import com.gu.contentapi.client.ContentApiClientLogic
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.model.{ItemQuery, SearchQuery}
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.Collection
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.ApiClient
import common._
import common.commercial.Branding
import conf.Configuration
import conf.switches.Switches.FaciaInlineEmbeds
import contentapi.{CircuitBreakingContentApiClient, ContentApiClient, QueryDefaults}
import fronts.FrontsApi
import model._
import model.facia.PressedCollection
import model.pressed._
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.ws.WS
import services.{ConfigAgent, S3FrontsApi}

import scala.concurrent.Future

object LiveFapiFrontPress extends FapiFrontPress {

  override implicit val capiClient: ContentApiClientLogic = CircuitBreakingContentApiClient(
    httpTimingMetric = ContentApiMetrics.HttpLatencyTimingMetric,
    httpTimeoutMetric = ContentApiMetrics.HttpTimeoutCountMetric,
    targetUrl = Configuration.contentApi.contentApiHost,
    apiKey = Configuration.contentApi.key.getOrElse("facia-press"),
    useThrift = false
  )

  implicit val apiClient: ApiClient = FrontsApi.amazonClient

  def pressByPathId(path: String): Future[Unit] =
    getPressedFrontForPath(path)
      .map { pressedFront => S3FrontsApi.putLiveFapiPressedJson(path, Json.stringify(Json.toJson(pressedFront)))}
      .asFuture.map(_.fold(
        e => {
          StatusNotification.notifyFailedJob(path, isLive = true, e)
          throw new RuntimeException(s"${e.cause} ${e.message}")},
        _ => StatusNotification.notifyCompleteJob(path, isLive = true)))

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity) =
    FAPI.liveCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
}

object DraftFapiFrontPress extends FapiFrontPress {

  override implicit val capiClient: ContentApiClientLogic = CircuitBreakingContentApiClient(
    httpTimingMetric = ContentApiMetrics.HttpLatencyTimingMetric,
    httpTimeoutMetric = ContentApiMetrics.HttpTimeoutCountMetric,
    targetUrl = Configuration.contentApi.contentApiDraftHost,
    apiKey = Configuration.contentApi.key.getOrElse("facia-press"),
    useThrift = false
  )

  implicit val apiClient: ApiClient = FrontsApi.amazonClient

  def pressByPathId(path: String): Future[Unit] =
    getPressedFrontForPath(path)
      .map { pressedFront => S3FrontsApi.putDraftFapiPressedJson(path, Json.stringify(Json.toJson(pressedFront)))}
      .asFuture.map(_.fold(
        e => {
          StatusNotification.notifyFailedJob(path, isLive = false, e)
          throw new RuntimeException(s"${e.cause} ${e.message}")
        },
        _ => StatusNotification.notifyCompleteJob(path, isLive = false)))

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity) =
    FAPI.draftCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
}

// This is the json structure we expect for an embed (know as a snap at render-time).
final case class EmbedJsonHtml(
  html: String
)

object EmbedJsonHtml {
  implicit val format = Json.format[EmbedJsonHtml]
}

trait FapiFrontPress extends Logging with ExecutionContexts {

  implicit val capiClient: ContentApiClientLogic
  implicit val apiClient: ApiClient
  def pressByPathId(path: String): Future[Unit]

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[PressedContent]]

  val showFields = "body,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalPageCode"
  val searchApiQuery: AdjustSearchQuery = (searchQuery: SearchQuery) =>
    searchQuery
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(QueryDefaults.references)

  val itemApiQuery: AdjustItemQuery = (itemQuery: ItemQuery) =>
    itemQuery
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(QueryDefaults.references)

  def generateCollectionJsonFromFapiClient(collectionId: String): Response[PressedCollection] =
    for {
      collection <- FAPI.getCollection(collectionId)
      curatedCollection <- getCurated(collection)
      backfill <- getBackfill(collection)
      treats <- getTreats(collection)
    } yield
      PressedCollection.fromCollectionWithCuratedAndBackfill(
        collection,
        curatedCollection.map(slimContent),
        backfill.map(slimContent),
        treats.map(slimContent))

  private def getCurated(collection: Collection): Response[List[PressedContent]] = {
    // Map initial PressedContent to enhanced content which contains pre-fetched embed content.
    val initialContent = collectionContentWithSnaps(collection, searchApiQuery, itemApiQuery)
    initialContent.flatMap { content =>
      Response.traverse( content.map {
        case curated: CuratedContent if FaciaInlineEmbeds.isSwitchedOn => enrichContent(collection, curated, curated.enriched).map { updatedFields =>
          curated.copy(enriched = Some(updatedFields))
        }
        case link: LinkSnap if FaciaInlineEmbeds.isSwitchedOn => enrichContent(collection, link, link.enriched).map { updatedFields =>
          link.copy(enriched = Some(updatedFields))
        }
        case plain => Response.Right(plain)
      })
    }
  }

  private def enrichContent(collection: Collection, content: PressedContent, enriched: Option[EnrichedContent]): Response[EnrichedContent] = {

      val beforeEnrichment = enriched.getOrElse(EnrichedContent.empty)

      val afterEnrichment = for {
        embedType <- content.properties.embedType if embedType == "json.html"
        embedUri <- content.properties.embedUri
      } yield {
        val maybeUpdate = WS.url(embedUri).get().map { response =>
          Json.parse(response.body).validate[EmbedJsonHtml] match {
            case JsSuccess(embed, _) => {
              beforeEnrichment.copy(embedHtml = Some(embed.html))
            }
            case _ => {
              log.warn(s"An embed had invalid json format, and won't be pressed. ${content.properties.webTitle} for collection ${collection.id}")
              beforeEnrichment
            }
          }
        } recover {
          case _ => {
            log.warn(s"A request to an embed uri failed, embed won't be pressed. $embedUri for collection ${collection.id}")
            beforeEnrichment
          }
        }
        Response.Async.Right(maybeUpdate)
      }
      afterEnrichment.getOrElse(Response.Right(beforeEnrichment))
  }

  private def getTreats(collection: Collection): Response[List[PressedContent]] = {
    FAPI.getTreatsForCollection(collection, searchApiQuery, itemApiQuery).map(_.map(PressedContent.make))
  }

  private def getBackfill(collection: Collection): Response[List[PressedContent]] = {
    FAPI.backfillFromConfig(collection.collectionConfig, searchApiQuery, itemApiQuery)
      .map(_.map(PressedContent.make))
  }

  private def getCollectionIdsForPath(path: String): Response[List[String]] =
    for(
      fronts <- FAPI.getFronts()
    ) yield fronts.find(_.id == path).map(_.collections).getOrElse {
      log.warn(s"There are no collections for path $path")
      throw new IllegalStateException(s"There are no collections for path $path")
    }

  def getPressedFrontForPath(path: String): Response[PressedPage] = {
    val collectionIds = getCollectionIdsForPath(path)
    collectionIds
      .flatMap(c => Response.traverse(c.map(generateCollectionJsonFromFapiClient)))
      .flatMap(result =>
        Response.Async.Right(getFrontSeoAndProperties(path).map{
          case (seoData, frontProperties) => PressedPage(path, seoData, frontProperties, result)
        }))
  }

  private def getFrontSeoAndProperties(path: String): Future[(SeoData, FrontProperties)] =
    for {
      itemResp <- getCapiItemResponseForPath(path)
    } yield {
      val seoFromConfig = ConfigAgent.getSeoDataJsonFromConfig(path)
      val seoFromPath = SeoData.fromPath(path)

      val navSection: String = seoFromConfig.navSection
        .orElse(itemResp.flatMap(getNavSectionFromItemResponse))
        .getOrElse(seoFromPath.navSection)
      val webTitle: String = seoFromConfig.webTitle
        .orElse(itemResp.flatMap(getWebTitleFromItemResponse))
        .getOrElse(seoFromPath.webTitle)
      val title: Option[String] = seoFromConfig.title
      val description: Option[String] = seoFromConfig.description
        .orElse(SeoData.descriptionFromWebTitle(webTitle))

      val frontProperties: FrontProperties = ConfigAgent.fetchFrontProperties(path)
        .copy(
          editorialType = itemResp.flatMap(_.tag).map(_.`type`.name),
          activeBrandings = itemResp.flatMap { response =>
            val sectionBrandings = response.section.flatMap { section =>
              section.activeSponsorships.map(_.map(Branding.make(section.webTitle)))
            }
            val tagBrandings = response.tag.flatMap { tag =>
              tag.activeSponsorships.map(_.map(Branding.make(tag.webTitle)))
            }
            val brandings = sectionBrandings.toList.flatten ++ tagBrandings.toList.flatten
            if (brandings.isEmpty) None else Some(brandings)
          }
        )

      val seoData: SeoData = SeoData(path, navSection, webTitle, title, description)
      (seoData, frontProperties)
    }

  private def getNavSectionFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag.flatMap(_.sectionId)
      .orElse(itemResponse.section.map(_.id).map(removeLeadEditionFromSectionId))

  private def getWebTitleFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag.map(_.webTitle)
      .orElse(itemResponse.section.map(_.webTitle))

  //This will turn au/culture into culture. We want to stay consistent with the manual entry and autogeneration
  private def removeLeadEditionFromSectionId(sectionId: String): String = sectionId.split('/').toList match {
    case edition :: tail if Edition.all.map(_.id.toLowerCase).contains(edition.toLowerCase) => tail.mkString("/")
    case _ => sectionId
  }

  private def getCapiItemResponseForPath(id: String): Future[Option[ItemResponse]] = {
    val contentApiResponse:Future[ItemResponse] = ContentApiClient.getResponse(
      ContentApiClient.item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
    )

    contentApiResponse.onSuccess { case _ =>
      log.info(s"Getting SEO data from content API for $id")}

    contentApiResponse.onFailure { case e: Exception =>
      log.warn(s"Error getting SEO data from content API for $id: $e")
    }

    contentApiResponse.map(Option(_)).fallbackTo(Future.successful(None))
  }

  private def mapContent(content: PressedContent)(f: ContentType => ContentType): PressedContent = {
    val mappedContent: Option[ContentType] = content.properties.maybeContent.map(f)
    val mappedProperties = content.properties.copy(maybeContent = mappedContent)

    content match {
      case curatedContent: CuratedContent => curatedContent.copy(properties = mappedProperties)
      case supporting: SupportingCuratedContent => supporting.copy(properties = mappedProperties)
      case linkSnap: LinkSnap => linkSnap.copy(properties = mappedProperties)
      case latestSnap: LatestSnap => latestSnap.copy(properties = mappedProperties)
    }
  }

  def slimContent(pressedContent: PressedContent): PressedContent = {
    val slimMaybeContent = pressedContent.properties.maybeContent.map { content =>

      // Discard all elements except the main video.
      // It is safe to do so because the trail picture is held in trailPicture in the Trail class.
      val slimElements = Elements.apply(content.elements.mainVideo.toList)
      val slimFields = content.fields.copy(body = HTML.takeFirstNElements(content.fields.body, 2), blocks = None)

      // Clear the config fields, because they are not used by facia. That is, the config of
      // an individual card is not used to render a facia front page.
      val slimMetadata = content.metadata.copy(
        javascriptConfigOverrides = Map(),
        opengraphPropertiesOverrides = Map(),
        twitterPropertiesOverrides = Map())

      val slimContent = content.content.copy(metadata = slimMetadata, elements = slimElements, fields = slimFields)

      content match {
        case article: Article => article.copy(content = slimContent)
        case video: Video => video.copy(content = slimContent)
        case audio: Audio => audio.copy(content = slimContent)
        case interactive: Interactive => interactive.copy(content = slimContent)
        case image: ImageContent => image.copy(content = slimContent)
        case gallery: Gallery => gallery.copy(content = slimContent)
        case generic: GenericContent => generic.copy(content = slimContent)
        case crossword: CrosswordContent => crossword.copy(content = slimContent)
      }
    }
    val slimProperties = pressedContent.properties.copy(maybeContent = slimMaybeContent)

    pressedContent match {
      case curatedContent: CuratedContent => curatedContent.copy(properties = slimProperties)
      case supporting: SupportingCuratedContent => supporting.copy(properties = slimProperties)
      case linkSnap: LinkSnap => linkSnap.copy(properties = slimProperties)
      case latestSnap: LatestSnap => latestSnap.copy(properties = slimProperties)
    }
  }

}
