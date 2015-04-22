package frontpress

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.client.model._
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.{Collection, _}
import com.gu.facia.api.{ApiError, FAPI, Response}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.FaciaPressMetrics.{ContentApiSeoRequestFailure, ContentApiSeoRequestSuccess}
import common.{ContentApiMetrics, Edition, ExecutionContexts, Logging}
import conf.{LiveContentApi, Configuration}
import contentapi.{CircuitBreakingContentApiClient, QueryDefaults}
import model.facia.PressedCollection
import model.{PressedPage, FrontProperties, SeoData}
import play.api.libs.json._
import services.{ConfigAgent, S3FrontsApi}

import scala.concurrent.Future

private case class ContentApiClientWithTarget(override val apiKey: String, override val targetUrl: String) extends GuardianContentClient(apiKey) with CircuitBreakingContentApiClient {
  lazy val httpTimingMetric = ContentApiMetrics.ElasticHttpTimingMetric
  lazy val httpTimeoutMetric = ContentApiMetrics.ElasticHttpTimeoutCountMetric
}

object LiveFapiFrontPress extends FapiFrontPress {
  val apiKey: String = Configuration.contentApi.key.getOrElse("facia-press")
  val stage: String = Configuration.facia.stage.toUpperCase
  val bucket: String = Configuration.aws.bucket
  val targetUrl: String = Configuration.contentApi.contentApiLiveHost

  override implicit val capiClient: GuardianContentClient = new ContentApiClientWithTarget(apiKey, targetUrl)
  private val amazonS3Client = new AmazonS3Client()
  implicit val apiClient: ApiClient = ApiClient(bucket, stage, AmazonSdkS3Client(amazonS3Client))

  def pressByPathId(path: String): Future[Unit] =
    getPressedFrontForPath(path)
      .map { pressedFront => S3FrontsApi.putLiveFapiPressedJson(path, Json.stringify(Json.toJson(pressedFront)))}
      .asFuture.map(_.fold(e => throw new RuntimeException(s"${e.cause} ${e.message}"), _ => ()))

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity) =
    FAPI.liveCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery)
}

object DraftFapiFrontPress extends FapiFrontPress {
  val apiKey: String = Configuration.contentApi.key.getOrElse("facia-press")
  val stage: String = Configuration.facia.stage.toUpperCase
  val bucket: String = Configuration.aws.bucket
  val targetUrl: String = Configuration.contentApi.contentApiDraftHost

  override implicit val capiClient: GuardianContentClient = new ContentApiClientWithTarget(apiKey, targetUrl)
  private val amazonS3Client = new AmazonS3Client()
  implicit val apiClient: ApiClient = ApiClient(bucket, stage, AmazonSdkS3Client(amazonS3Client))

  def pressByPathId(path: String): Future[Unit] =
    getPressedFrontForPath(path)
      .map { pressedFront => S3FrontsApi.putDraftFapiPressedJson(path, Json.stringify(Json.toJson(pressedFront)))}
      .asFuture.map(_.fold(e => throw new RuntimeException(s"${e.cause} ${e.message}"), _ => ()))

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity) =
    FAPI.draftCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery)
}

trait FapiFrontPress extends QueryDefaults with Logging with ExecutionContexts {
  import model.facia.FapiJsonFormats._

  implicit val capiClient: GuardianContentClient
  implicit val apiClient: ApiClient
  def pressByPathId(path: String): Future[Unit]

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[FaciaContent]]

  val showFields = "body,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalContentCode"
  val searchApiQuery: AdjustSearchQuery = (searchQuery: SearchQuery) =>
    searchQuery
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(references)

  val itemApiQuery: AdjustItemQuery = (itemQuery: ItemQuery) =>
    itemQuery
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(references)

  def generateFrontJsonFromFapiClient(): Response[JsValue] =
    for {
      frontsSet <- FAPI.getFronts()
    } yield Json.toJson(frontsSet.toList)

  def generateCollectionJsonFromFapiClient(collectionId: String): Response[PressedCollection] =
    for {
      collection <- FAPI.getCollection(collectionId)
      curatedCollection <- collectionContentWithSnaps(collection, searchApiQuery, itemApiQuery)
      backfill <- getBackfill(collection)
      treats <- FAPI.getTreatsForCollection(collection, searchApiQuery, itemApiQuery)
    } yield PressedCollection.fromCollectionWithCuratedAndBackfill(collection, curatedCollection, backfill, treats)

  private def getBackfill(collection: Collection): Response[List[FaciaContent]] =
    collection
      .collectionConfig
      .apiQuery
      .map { query =>
      FAPI.backfill(query, collection, searchApiQuery, itemApiQuery)}
      .getOrElse{Response.Right(Nil)}

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
        .copy(editorialType = itemResp.flatMap(_.tag).map(_.`type`))

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
    val contentApiResponse:Future[ItemResponse] = LiveContentApi.getResponse(LiveContentApi
      .item(id, Edition.defaultEdition)
      .showEditorsPicks(false)
      .pageSize(0)
    )

    contentApiResponse.onSuccess { case _ =>
      ContentApiSeoRequestSuccess.increment()
      log.info(s"Getting SEO data from content API for $id")}

    contentApiResponse.onFailure { case e: Exception =>
      log.warn(s"Error getting SEO data from content API for $id: $e")
      ContentApiSeoRequestFailure.increment()
    }

    contentApiResponse.map(Option(_)).fallbackTo(Future.successful(None))
  }

}
