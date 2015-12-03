package frontpress

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.client.model._
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.{Collection, CuratedContent, _}
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.Edition
import common.FaciaPressMetrics.{ContentApiSeoRequestFailure, ContentApiSeoRequestSuccess}
import common._
import conf.{Configuration, LiveContentApi}
import contentapi.{CircuitBreakingContentApiClient, QueryDefaults}
import implicits.FaciaContentFrontendHelpers._
import model.facia.PressedCollection
import model.{FrontProperties, PressedPage, SeoData}
import org.jsoup.Jsoup
import play.api.libs.json._
import services.{ConfigAgent, S3FrontsApi}
import views.support.{Item460, Item140, Naked}

import scala.collection.JavaConversions._
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

private case class ContentApiClientWithTarget(override val apiKey: String, override val targetUrl: String) extends GuardianContentClient(apiKey) with CircuitBreakingContentApiClient {
  lazy val httpTimingMetric = ContentApiMetrics.ElasticHttpTimingMetric
  lazy val httpTimeoutMetric = ContentApiMetrics.ElasticHttpTimeoutCountMetric

  override def fetch(url: String)(implicit context: ExecutionContext): Future[String] = {
    val futureString: Future[String] = super.fetch(url)(context)
    futureString.onFailure{ case t =>
      val tryDecodedUrl: String = Try(java.net.URLDecoder.decode(url, "UTF-8")).getOrElse(url)
      log.error(s"$t: $tryDecodedUrl")}
    futureString
  }
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

  val showFields = "body,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalContentCode,internalPageCode"
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
    } yield
      PressedCollection.fromCollectionWithCuratedAndBackfill(
        collection,
        curatedCollection.map(slimElements).map(slimBody),
        backfill.map(slimElements).map(slimBody),
        treats.map(slimElements).map(slimBody))

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

  def mapContent(faciaContent: FaciaContent)(f: Content => Content): FaciaContent =
    faciaContent match {
      case curatedContent: CuratedContent => curatedContent.copy(content = f(curatedContent.content))
      case supporting: SupportingCuratedContent => supporting.copy(content = f(supporting.content))
      case linkSnap: LinkSnap => linkSnap
      case latestSnap: LatestSnap => latestSnap.copy(latestContent = latestSnap.latestContent.map(f))}


  def slimElements(faciaContent: FaciaContent): FaciaContent = {
    val slimElements: Option[List[Element]] =
      Option(
        faciaContent.trailPictureAll(5, 3).map { imageContainer =>
          val naked = Naked.elementFor(imageContainer)

          //These sizes are used in RSS
          val size140 = Item140.elementFor(imageContainer)
          val size460 = Item460.elementFor(imageContainer)

          imageContainer.delegate.copy(assets =
            (naked ++ size140 ++ size460).map(_.delegate).toList
          )} ++
          faciaContent.mainVideo.map(_.delegate))
        .filter(_.nonEmpty)

    mapContent(faciaContent)(c => c.copy(elements = slimElements))
  }

  //This is used to slim the body key in fields of the CAPI Content type
  //We only need the first two elements of the body which is used by RSS
  def slimBody(faciaContent: FaciaContent): FaciaContent = {
    mapContent(faciaContent){ content =>
      val newFields = content.fields.map { fieldsMap =>
        val newBody = fieldsMap.get("body").map {body =>
          "body" -> HTML.takeFirstNElements(body, 2)
         }
        newBody.fold(fieldsMap)(fieldsMap + _)
      }
      content.copy(fields = newFields)
    }
  }


}
