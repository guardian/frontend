package frontpress

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.client.model._
import com.gu.facia.api.contentapi.ContentApi.AdjustSearchQuery
import com.gu.facia.api.models.{Collection, _}
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.{ExecutionContexts, Logging}
import conf.Configuration
import contentapi.QueryDefaults
import model.facia.{PressedCollection, PressedFront}
import model.{FrontProperties, SeoData}
import play.api.libs.json._
import services.S3FrontsApi

import scala.concurrent.Future

private case class TestContentApiClient(override val apiKey: String, override val targetUrl: String) extends GuardianContentClient(apiKey)

trait TestClient extends ExecutionContexts {
  val apiKey: String = scala.sys.env.getOrElse("CONTENT_API_KEY", "")
  val targetUrl: Option[String] = scala.sys.env.get("FACIA_CLIENT_TARGET_URL")

  implicit val capiClient: GuardianContentClient =
    targetUrl.fold(ifEmpty = new GuardianContentClient(apiKey)){ targetUrl =>
      new TestContentApiClient(
        apiKey,
        targetUrl)}

  private val amazonS3Client = new AmazonS3Client()
  implicit val apiClient: ApiClient = ApiClient("aws-frontend-store", "FRANCIS", AmazonSdkS3Client(amazonS3Client))
}

object FapiFrontPress extends TestClient with QueryDefaults with Logging {
  import model.facia.FapiJsonFormats._

  val showFields = "body,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalContentCode"
  val apiQuery: AdjustSearchQuery = (searchQuery: SearchQuery) =>
    searchQuery
      .showFields(showFields)
      .showElements("all")
      .pageSize(Configuration.faciatool.frontPressItemSearchBatchSize)
      .showTags("all")
      .showReferences(references)

  def generateFrontJsonFromFapiClient(): Response[JsValue] =
    for {
      frontsSet <- FAPI.getFronts()
    } yield Json.toJson(frontsSet.toList)

  def generateCollectionJsonFromFapiClient(collectionId: String): Response[PressedCollection] =
    for {
      collection <- FAPI.getCollection(collectionId)
      curatedCollection <- FAPI.collectionContentWithoutSnaps(collection, apiQuery)
      backfill <- getBackfill(collection)
    } yield PressedCollection.fromCollectionWithCuratedAndBackfill(collection, curatedCollection, backfill)

  private def getBackfill(collection: Collection): Response[List[FaciaContent]] =
    collection
      .apiQuery
      .map { query =>
      FAPI.backfill(query, collection, apiQuery)}
      .getOrElse{Response.Right(Nil)}

  private def getCollectionIdsForPath(path: String): Response[List[String]] =
    for(
      fronts <- FAPI.getFronts()
    ) yield fronts.find(_.id == path).map(_.collections).getOrElse {
      log.warn(s"There are no collections for path $path")
      throw new IllegalStateException(s"There are no collections for path $path")
    }

  def getPressedFrontForPath(path: String): Response[PressedFront] = {
    val collectionIds = getCollectionIdsForPath(path)
    collectionIds
      .flatMap(c => Response.traverse(c.map(generateCollectionJsonFromFapiClient)))
      .map(result => PressedFront(path, SeoData.empty, FrontProperties.empty, result))
  }

  def pressLiveByPathId(path: String): Future[Unit] =
    getPressedFrontForPath(path)
      .map { pressedFront => S3FrontsApi.putLivePressedJson(path, Json.stringify(Json.toJson(pressedFront)))}
      .asFuture.map(_.fold(_ => (), _ => ()))

}
