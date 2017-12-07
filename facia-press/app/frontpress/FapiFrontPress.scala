package frontpress

import metrics.SamplerMetric
import com.gu.contentapi.client.ContentApiClientLogic
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.model.{ItemQuery, SearchQuery}
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.{Collection, Front}
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{Breaking, ConfigJson, Metadata, Special}
import common._
import common.commercial.CommercialProperties
import conf.Configuration
import conf.switches.Switches.FaciaInlineEmbeds
import contentapi.{CapiHttpClient, CircuitBreakingContentApiClient, ContentApiClient, QueryDefaults}
import services.fronts.FrontsApi
import model.{PressedPage, _}
import model.facia.PressedCollection
import model.pressed._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.libs.ws.WSClient
import services.{ConfigAgent, S3FrontsApi}
import implicits.Booleans._
import layout.slices.Container

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class LiveFapiFrontPress(val wsClient: WSClient, val capiClientForFrontsSeo: ContentApiClient)(implicit ec: ExecutionContext) extends FapiFrontPress {

  override def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit = S3FrontsApi.putLiveFapiPressedJson(path, json, pressedType)
  override def isLiveContent: Boolean = true

  override implicit val capiClient: ContentApiClientLogic = CircuitBreakingContentApiClient(
    httpClient = new CapiHttpClient(wsClient),
    targetUrl = Configuration.contentApi.contentApiHost,
    apiKey = Configuration.contentApi.key.getOrElse("facia-press")
  )

  implicit val fapiClient: ApiClient = FrontsApi.crossAccountClient

  override def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[PressedContent]] =
    FAPI.liveCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
}

class DraftFapiFrontPress(val wsClient: WSClient, val capiClientForFrontsSeo: ContentApiClient)(implicit ec: ExecutionContext) extends FapiFrontPress {

  override implicit val capiClient: ContentApiClientLogic = CircuitBreakingContentApiClient(
    httpClient = new CapiHttpClient(wsClient),
    targetUrl = Configuration.contentApi.contentApiDraftHost,
    apiKey = Configuration.contentApi.key.getOrElse("facia-press")
  )

  implicit val fapiClient: ApiClient = FrontsApi.crossAccountClient

  override def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit = S3FrontsApi.putDraftFapiPressedJson(path, json, pressedType)
  override def isLiveContent: Boolean = false

  override def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[PressedContent]] =
    FAPI.draftCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
}

// This is the json structure we expect for an embed (know as a snap at render-time).
final case class EmbedJsonHtml(
  html: String
)

object EmbedJsonHtml {
  implicit val format = Json.format[EmbedJsonHtml]
}

trait FapiFrontPress extends Logging {

  implicit val capiClient: ContentApiClientLogic
  implicit def fapiClient: ApiClient
  val capiClientForFrontsSeo: ContentApiClient
  val wsClient: WSClient
  def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit
  def isLiveContent: Boolean

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[PressedContent]]

  val showFields = "body,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalPageCode,main"
  val searchApiQuery: AdjustSearchQuery = (searchQuery: SearchQuery) =>
    searchQuery
      .showSection(true)
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(QueryDefaults.references)
      .showAtoms("media")

  val itemApiQuery: AdjustItemQuery = (itemQuery: ItemQuery) =>
    itemQuery
      .showSection(true)
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(QueryDefaults.references)
      .showAtoms("media")

  def pressByPathId(path: String)(implicit executionContext: ExecutionContext): Future[Unit] = {

    val stopWatch: StopWatch = new StopWatch

    val pressFuture = getPressedFrontForPath(path)
      .map { pressedFronts: PressedPageVersions =>
        putPressedPage(path, pressedFronts.full, FullType)
        putPressedPage(path, pressedFronts.lite, LiteType)
      }.fold(
        e => {
          StatusNotification.notifyFailedJob(path, isLive = isLiveContent, e)
          throw new RuntimeException(s"${e.cause} ${e.message}")
        },
        _ => StatusNotification.notifyCompleteJob(path, isLive = isLiveContent)
      )


    pressFuture.onComplete {
      case Success(_) =>
        val pressDuration: Long = stopWatch.elapsed
        log.info(s"Successfully pressed $path in $pressDuration ms")
        FaciaPressMetrics.AllFrontsPressLatencyMetric.recordDuration(pressDuration)
        /** We record separate metrics for each of the editions' network fronts */
        val metricsByPath = Map(
          "uk" -> FaciaPressMetrics.UkPressLatencyMetric,
          "us" -> FaciaPressMetrics.UsPressLatencyMetric,
          "au" -> FaciaPressMetrics.AuPressLatencyMetric
        )
        if (Edition.all.map(_.id.toLowerCase).contains(path)) {
          metricsByPath.get(path).foreach { metric =>
            metric.recordDuration(pressDuration)
          }
        }
      case Failure(error) =>
        log.warn(s"Failed to press '$path':", error)
    }

    pressFuture
  }

  private def putPressedPage(path: String, pressedFront: PressedPage, pressedType: PressedPageType): Unit = {
    val json: String = Json.stringify(Json.toJson(pressedFront))

    val metric: SamplerMetric = pressedType match {
      case FullType => FaciaPressMetrics.FrontPressContentSize
      case LiteType => FaciaPressMetrics.FrontPressContentSizeLite
    }

    metric.recordSample(json.getBytes.length, new DateTime())
    putPressedJson(path, json, pressedType)
  }

  def generateCollectionJsonFromFapiClient(collectionId: String)(implicit executionContext: ExecutionContext): Response[PressedCollectionVersions] = {
    for {
      collection <- FAPI.getCollection(collectionId)
      curated <- getCurated(collection)
      backfill <- getBackfill(collection)
      treats <- getTreats(collection)
    } yield {
      val doNotTrimContainerOfTypes = Seq("nav/list")
      val storyCountTotal = curated.length + backfill.length
      val storyCountMax: Int = doNotTrimContainerOfTypes
        .contains(collection.collectionConfig.collectionType)
        .toOption(storyCountTotal)
        .getOrElse(Math.min(Configuration.facia.collectionCap, storyCountTotal))
      val storyCountVisible = Container.storiesCount(collection.collectionConfig.collectionType, curated ++ backfill).getOrElse(storyCountMax)
      val hasMore = storyCountVisible < storyCountMax

      PressedCollectionVersions(
        pressCollection(collection, curated, backfill, treats, storyCountVisible, hasMore),
        pressCollection(collection, curated, backfill, treats, storyCountMax, hasMore)
      )
    }
  }


  private def pressCollection(
    collection: Collection,
    curated: List[PressedContent],
    backfill: List[PressedContent],
    treats: List[PressedContent],
    storyCount: Int,
    hasMore: Boolean
  ) = {
    val trimmedCurated = curated.take(storyCount)
    val trimmedBackfill = backfill.take(storyCount - trimmedCurated.length)
    PressedCollection.fromCollectionWithCuratedAndBackfill(
      collection,
      trimmedCurated,
      trimmedBackfill,
      treats,
      hasMore
    )
  }

  private def getCurated(collection: Collection)(implicit executionContext: ExecutionContext): Response[List[PressedContent]] = {
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

  private def enrichContent(collection: Collection, content: PressedContent, enriched: Option[EnrichedContent])(implicit executionContext: ExecutionContext): Response[EnrichedContent] = {

      val beforeEnrichment = enriched.getOrElse(EnrichedContent.empty)

      val afterEnrichment = for {
        embedType <- content.properties.embedType if embedType == "json.html"
        embedUri <- content.properties.embedUri
      } yield {
        val maybeUpdate = wsClient.url(embedUri).get().map { response =>
          Json.fromJson[EmbedJsonHtml](response.json) match {
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

  private def getTreats(collection: Collection)(implicit executionContext: ExecutionContext): Response[List[PressedContent]] = {
    FAPI.getTreatsForCollection(collection, searchApiQuery, itemApiQuery).map(_.map(PressedContent.make))
  }

  private def getBackfill(collection: Collection)(implicit executionContext: ExecutionContext): Response[List[PressedContent]] = {
    FAPI.backfillFromConfig(collection.collectionConfig, searchApiQuery, itemApiQuery)
      .map(_.map(PressedContent.make))
  }

  private def findCollectionByMetadata(metadata: Metadata, path: String, config: ConfigJson): Option[String] =
    (for {
      front <- config.fronts.get(path).toList
      collectionId <- front.collections
      collectionConfig <- config.collections.get(collectionId) if collectionConfig.metadata.exists(_.contains(metadata))
    } yield collectionId).headOption

  private def withHighPriorityCollections(parentPath: String, config: ConfigJson, collections: List[String]): List[String] =
    collections match {
      case head :: tail =>
        List(
          findCollectionByMetadata(Breaking, parentPath, config),
          Some(head),
          findCollectionByMetadata(Special, parentPath, config)
        ).flatten ++ tail
      case Nil => Nil
    }

  private def enrichEmailFronts(path: String, config: ConfigJson)(collections: List[String]) =
    path match {
      case "email/uk/daily" => withHighPriorityCollections("uk", config, collections)
      case "email/us/daily" => withHighPriorityCollections("us", config, collections)
      case "email/au/daily" => withHighPriorityCollections("au", config, collections)
      case _ => collections
    }

  private def getCollectionIdsForPath(path: String)(implicit executionContext: ExecutionContext): Response[List[String]] =
    Response.Async.Right(fapiClient.config) map { config =>
      Front.frontsFromConfig(config)
        .find(_.id == path)
        .map(_.collections)
        .map(enrichEmailFronts(path, config))
        .getOrElse {
        log.warn(s"There are no collections for path $path")
        throw new IllegalStateException(s"There are no collections for path $path")
      }
    }

  def getPressedFrontForPath(path: String)(implicit executionContext: ExecutionContext): Response[PressedPageVersions] = {
    for {
      collectionIds <- getCollectionIdsForPath(path)
      pressedCollections <- Response.traverse(collectionIds.map(generateCollectionJsonFromFapiClient))
      seoWithProperties <- Response.Async.Right(getFrontSeoAndProperties(path))
    } yield seoWithProperties match {
      case (seoData, frontProperties) => PressedPageVersions.fromPressedCollections(path, seoData, frontProperties, pressedCollections)
    }
  }

  private def getFrontSeoAndProperties(path: String)(implicit executionContext: ExecutionContext): Future[(SeoData, FrontProperties)] =
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

      val frontProperties: FrontProperties = ConfigAgent.fetchFrontProperties(path).copy(
        editorialType = itemResp.flatMap(_.tag).map(_.`type`.name),
        /*
         * We expect the capi response for a front to have exclusively either a tag or a section or neither,
         * according to whether it is a section front, a tag page or a page unknown to capi respectively.
         * Thus the order in which tag and section are processed is unimportant.
         */
        commercial = {
          val tag = itemResp flatMap (_.tag)
          val section = itemResp flatMap (_.section)
          tag.map(CommercialProperties.fromTag) orElse
            section.map(CommercialProperties.fromSection) orElse
            CommercialProperties.forNetworkFront(path) orElse
            Some(CommercialProperties.forFrontUnknownToCapi(path))
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

  private def getCapiItemResponseForPath(id: String)(implicit executionContext: ExecutionContext): Future[Option[ItemResponse]] = {
    val contentApiResponse:Future[ItemResponse] = capiClientForFrontsSeo.getResponse(
      capiClientForFrontsSeo.item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
    )

    contentApiResponse.foreach { _ =>
      log.info(s"Getting SEO data from content API for $id")}

    contentApiResponse.failed.foreach { e: Throwable =>
      log.warn(s"Error getting SEO data from content API for $id: $e")
    }

    contentApiResponse.map(Option(_)).fallbackTo(Future.successful(None))
  }

}
