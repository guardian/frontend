package frontpress

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
import model._
import model.facia.PressedCollection
import model.pressed._
import org.joda.time.DateTime
import play.api.libs.json._
import play.api.libs.ws.WSClient
import services.{ConfigAgent, S3FrontsApi}

import scala.concurrent.Future
import scala.util.{Failure, Success}

class LiveFapiFrontPress(val wsClient: WSClient, val capiClientForFrontsSeo: ContentApiClient) extends FapiFrontPress {

  override def putPressedJson(path: String, json: String): Unit = S3FrontsApi.putLiveFapiPressedJson(path, json)
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
    adjustSnapItemQuery: AdjustItemQuery = identity) =
    FAPI.liveCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
}

class DraftFapiFrontPress(val wsClient: WSClient, val capiClientForFrontsSeo: ContentApiClient) extends FapiFrontPress {

  override implicit val capiClient: ContentApiClientLogic = CircuitBreakingContentApiClient(
    httpClient = new CapiHttpClient(wsClient),
    targetUrl = Configuration.contentApi.contentApiDraftHost,
    apiKey = Configuration.contentApi.key.getOrElse("facia-press")
  )

  implicit val fapiClient: ApiClient = FrontsApi.crossAccountClient

  override def putPressedJson(path: String, json: String): Unit = S3FrontsApi.putDraftFapiPressedJson(path, json)
  override def isLiveContent: Boolean = false

  override def collectionContentWithSnaps(
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
  implicit def fapiClient: ApiClient
  val capiClientForFrontsSeo: ContentApiClient
  val wsClient: WSClient
  def putPressedJson(path: String, json: String): Unit
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

  def pressByPathId(path: String): Future[Unit] = {

    val stopWatch: StopWatch = new StopWatch

    val pressFuture = getPressedFrontForPath(path)
      .map { pressedFront =>
        val json: String = Json.stringify(Json.toJson(pressedFront))
        FaciaPressMetrics.FrontPressContentSize.recordSample(json.getBytes.length, new DateTime())
        putPressedJson(path, json)
      }
      .asFuture
      .map(
        _.fold(
          e => {
            StatusNotification.notifyFailedJob(path, isLive = isLiveContent, e)
            throw new RuntimeException(s"${e.cause} ${e.message}")
          },
          _ => StatusNotification.notifyCompleteJob(path, isLive = isLiveContent))
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

  def generateCollectionJsonFromFapiClient(collectionId: String): Response[PressedCollection] =
    for {
      collection <- FAPI.getCollection(collectionId)
      curatedCollection <- getCurated(collection)
      backfill <- getBackfill(collection)
      treats <- getTreats(collection)
    } yield {
      PressedCollection.fromCollectionWithCuratedAndBackfill(
        collection,
        curatedCollection,
        backfill,
        treats
      )
    }

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
        val maybeUpdate = wsClient.url(embedUri).get().map { response =>
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

  private def getCollectionIdsForPath(path: String): Response[List[String]] =
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

  private def getCapiItemResponseForPath(id: String): Future[Option[ItemResponse]] = {
    val contentApiResponse:Future[ItemResponse] = capiClientForFrontsSeo.getResponse(
      capiClientForFrontsSeo.item(id, Edition.defaultEdition)
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

}
