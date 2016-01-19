package frontpress

import com.amazonaws.services.s3.AmazonS3Client
import com.gu.contentapi.client.GuardianContentClient
import com.gu.contentapi.client.model.{SearchQuery, ItemQuery, ItemResponse}
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.Collection
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.{AmazonSdkS3Client, ApiClient}
import common.FaciaPressMetrics.{ContentApiSeoRequestFailure, ContentApiSeoRequestSuccess}
import common._
import conf.{Configuration, LiveContentApi}
import contentapi.{CircuitBreakingContentApiClient, QueryDefaults}
import model.facia.PressedCollection
import model.pressed._
import model._
import org.apache.commons.lang.exception.ExceptionUtils
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
    FAPI.liveCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
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
    FAPI.draftCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery).map(_.map(PressedContent.make))
}

trait FapiFrontPress extends QueryDefaults with Logging with ExecutionContexts {

  implicit val capiClient: GuardianContentClient
  implicit val apiClient: ApiClient
  def pressByPathId(path: String): Future[Unit]

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[PressedContent]]

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
    collectionContentWithSnaps(collection, searchApiQuery, itemApiQuery)
  }

  private def getTreats(collection: Collection): Response[List[PressedContent]] = {
    FAPI.getTreatsForCollection(collection, searchApiQuery, itemApiQuery).map(_.map(PressedContent.make))
  }

  private def getBackfill(collection: Collection): Response[List[PressedContent]] = {
    collection
      .collectionConfig
      .apiQuery
      .map { query =>
        FAPI.backfill(query, collection, searchApiQuery, itemApiQuery)
      }
      .getOrElse {
        Response.Right(Nil)
      }.map(_.map(PressedContent.make))
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
        .copy(editorialType = itemResp.flatMap(_.tag).map(_.`type`.name))

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
      val slimElements: Seq[Option[Element]] = content.elements.trailPictureAll(5, 3).map { element =>
        val naked = Naked.elementFor(element.images)

        //These sizes are used in RSS
        val size140 = Item140.elementFor(element.images)
        val size460 = Item460.elementFor(element.images)

        val paredImages = ImageMedia.make(Seq(naked ++ size140 ++ size460).flatten.distinct)

        val slimElement: Element = element match {
          case image: ImageElement => image.copy(images = paredImages)
          case video: VideoElement => video.copy(images = paredImages)
          case audio: AudioElement => audio.copy(images = paredImages)
          case embed: EmbedElement => embed.copy(images = paredImages)
          case default: DefaultElement => default.copy(images = paredImages)
        }
        Some(slimElement)
      }
      val elements = Elements.apply((slimElements :+ content.elements.mainVideo).flatten)
      val slimFields = content.fields.copy(body = HTML.takeFirstNElements(content.fields.body, 2), blocks = Nil)

      val slimTrailPicture = content.trail.trailPicture.map { imageMedia =>
        val naked = Naked.elementFor(imageMedia)

        //These sizes are used in RSS
        val size140 = Item140.elementFor(imageMedia)
        val size460 = Item460.elementFor(imageMedia)

        ImageMedia.make(Seq(naked ++ size140 ++ size460).flatten.distinct)
      }

      val slimTrail = content.trail.copy(trailPicture = slimTrailPicture)

      // Clear the config fields, because they are not used by facia. That is, the config of
      // an individual card is not used to render a facia front page.
      val slimMetadata = content.metadata.copy(
        javascriptConfigOverrides = Map(),
        opengraphPropertiesOverrides = Map(),
        twitterPropertiesOverrides = Map())

      val slimContent = content.content.copy(metadata = slimMetadata, elements = elements, fields = slimFields, trail = slimTrail)

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
