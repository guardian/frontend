package frontpress

import metrics.SamplerMetric
import com.gu.contentapi.client.{ContentApiClient => CapiContentApiClient}
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.model.{ItemQuery, SearchQuery}
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.{Collection, Front}
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{Breaking, Canonical, ConfigJson, Metadata, Special}
import common._
import common.commercial.CommercialProperties
import conf.Configuration
import conf.switches.Switches
import conf.switches.Switches.FaciaInlineEmbeds
import contentapi._
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

  override implicit val capiClient: CapiContentApiClient = CircuitBreakingContentApiClient(
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

  override implicit val capiClient: CapiContentApiClient = CircuitBreakingContentApiClient(
    httpClient = new CapiHttpClient(wsClient) { override val signer = Some(PreviewSigner()) },
    targetUrl = Configuration.contentApi.previewHost
      .filter(_ => Switches.FaciaToolDraftContent.isSwitchedOn)
      .getOrElse(Configuration.contentApi.contentApiHost),
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

case class EmailFrontPath(path: String, edition: String)

object EmailFrontPath {
  def fromPath(path: String): Option[EmailFrontPath] = path match {
    case "email/uk/daily" => Some(EmailFrontPath(path, "uk"))
    case "email/us/daily" => Some(EmailFrontPath(path, "us"))
    case "email/au/daily" => Some(EmailFrontPath(path, "au"))
    case _ => None
  }
}

case class EmailExtraCollections(canonical: PressedCollectionVisibility,
                                 special: Option[PressedCollectionVisibility],
                                 breaking: Option[PressedCollectionVisibility])

trait EmailFrontPress extends Logging {

  implicit def fapiClient: ApiClient
  def generatePressedVersions(path: String, allPressedCollections: List[PressedCollectionVisibility], seoData: SeoData, frontProperties: FrontProperties): PressedPageVersions
  def collectionsIdsFromConfigForPath(path: String, config: ConfigJson): List[String]
  def generateCollectionJsonFromFapiClient(collectionId: String)(implicit executionContext: ExecutionContext): Response[PressedCollectionVisibility]
  def getFrontSeoAndProperties(path: String)(implicit executionContext: ExecutionContext): Future[(SeoData, FrontProperties)]

  private def mergeExtraEmailCollections(pressedCollections: List[PressedCollectionVisibility], emailCollections: EmailExtraCollections): List[PressedCollectionVisibility] = {
    emailCollections.breaking.toList ::: List(emailCollections.canonical) ::: emailCollections.special.toList ::: pressedCollections
  }

  def pressEmailFront(emailFrontPath: EmailFrontPath)(implicit executionContext: ExecutionContext): Response[PressedPageVersions] = {
    for {
      config <- Response.Async.Right(fapiClient.config)
      collectionIds = collectionsIdsFromConfigForPath(emailFrontPath.path, config)
      pressedCollections <- Response.traverse(collectionIds.map(generateCollectionJsonFromFapiClient))
      extraEmailCollections <- buildExtraEmailCollections(emailFrontPath, config, pressedCollections)
      allPressedCollections = mergeExtraEmailCollections(pressedCollections, extraEmailCollections)
      seoWithProperties: (SeoData, FrontProperties) <- Response.Async.Right(getFrontSeoAndProperties(emailFrontPath.path))
    } yield seoWithProperties match {
      case (seoData, frontProperties) => generatePressedVersions(emailFrontPath.path, allPressedCollections, seoData, frontProperties)
    }
  }

  def buildExtraEmailCollections(frontPath: EmailFrontPath,
                                 config: ConfigJson,
                                 pressedCollections: List[PressedCollectionVisibility])(implicit ec: ExecutionContext): Response[EmailExtraCollections] = {
    def findCollectionId(metadata: Metadata) = {
      for {
        front <- config.fronts.get(frontPath.edition).toList
        collectionId <- front.collections
        collectionConfig <- config.collections.get(collectionId) if collectionConfig.metadata.exists(_.contains(metadata))
      } yield collectionId
    }

    def renameMetaCollection(visible: Int, replacementName: String, metaCollection: PressedCollectionVisibility) = {
      if (pressedCollections.map(_.pressedCollection.displayName).contains(metaCollection.pressedCollection.displayName))
        metaCollection.withDisplayName(replacementName).withVisible(visible)
      else
        metaCollection.withVisible(visible)
    }

    def pressedCollectionFromMetaTag(meta: Metadata): Response[Option[PressedCollectionVisibility]] = {
      findCollectionId(meta).headOption.map { breakingCollectionId: String =>
        generateCollectionJsonFromFapiClient(breakingCollectionId).map { pressedCollection: PressedCollectionVisibility =>
          Some(pressedCollection)
        }
      }.getOrElse(Response.Right(None))
    }

    val canonicalCollectionId = findCollectionId(Canonical)
      .headOption
      .getOrElse(throw new RuntimeException(s"Unable to find Canonical headline on ${frontPath.edition}"))

    val canonicalPressedF = generateCollectionJsonFromFapiClient(canonicalCollectionId).map { canonicalPressed =>
      canonicalPressed.withVisible(6).withDisplayName("headlines")
    }

    val breakingPressedF = pressedCollectionFromMetaTag(Breaking).map(_.map(renameMetaCollection(5, "breaking news", _)))
    val specialPressedF = pressedCollectionFromMetaTag(Special).map(_.map(renameMetaCollection(1, "special report", _)))

    for {
      canonicalPressed <- canonicalPressedF
      breakingPressed <- breakingPressedF
      specialPressed <- specialPressedF
    } yield EmailExtraCollections(canonicalPressed, specialPressed, breakingPressed)

  }

}

trait FapiFrontPress extends EmailFrontPress with Logging {

  implicit val capiClient: CapiContentApiClient
  implicit def fapiClient: ApiClient
  val capiClientForFrontsSeo: ContentApiClient
  val wsClient: WSClient
  def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit
  def isLiveContent: Boolean

  def collectionContentWithSnaps(
    collection: Collection,
    adjustSearchQuery: AdjustSearchQuery = identity,
    adjustSnapItemQuery: AdjustItemQuery = identity): Response[List[PressedContent]]

  val showFields = "body,displayHint,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalPageCode,main"
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
        putPressedPage(path, pressedFronts.fullAdFree, FullAdFreeType)
        putPressedPage(path, pressedFronts.liteAdFree, LiteAdFreeType)
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
      case LiteAdFreeType => FaciaPressMetrics.FrontPressContentSizeLite
      case FullAdFreeType => FaciaPressMetrics.FrontPressContentSize
    }

    metric.recordSample(json.getBytes.length, new DateTime())
    putPressedJson(path, json, pressedType)
  }

  def generateCollectionJsonFromFapiClient(collectionId: String)(implicit executionContext: ExecutionContext): Response[PressedCollectionVisibility] = {
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
      val storyCountVisible = Container.storiesCount(
        CollectionConfig.make(collection.collectionConfig),
        curated ++ backfill
      ).getOrElse(storyCountMax)

      val pressedCollection = pressCollection(collection, curated, backfill, treats, storyCountMax)
      PressedCollectionVisibility(pressedCollection, storyCountVisible)
    }
  }

  private def pressCollection(
    collection: Collection,
    curated: List[PressedContent],
    backfill: List[PressedContent],
    treats: List[PressedContent],
    storyCount: Int
  ) = {
    val trimmedCurated = curated.take(storyCount)
    val trimmedBackfill = backfill.take(storyCount - trimmedCurated.length)
    PressedCollection.fromCollectionWithCuratedAndBackfill(
      collection,
      trimmedCurated,
      trimmedBackfill,
      treats
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

  def generatePressedVersions(path: String, allPressedCollections: List[PressedCollectionVisibility], seoData: SeoData, frontProperties: FrontProperties): PressedPageVersions = {
    val webCollections = allPressedCollections.filter(PressedCollectionVisibility.isWebCollection)
    val dedupliatedCollections = PressedCollectionVisibility.deduplication(webCollections)
      .map(_.pressedCollectionVersions)
      .toList
    PressedPageVersions.fromPressedCollections(path, seoData, frontProperties, dedupliatedCollections)
  }

  def collectionsIdsFromConfigForPath(path: String, config: ConfigJson): List[String] = {
    Front.frontsFromConfig(config)
      .find(_.id == path)
      .map(_.collections)
      .getOrElse {
        log.warn(s"There are no collections for path $path")
        throw new IllegalStateException(s"There are no collections for path $path")
      }
  }

  def getPressedFrontForPath(path: String)(implicit executionContext: ExecutionContext): Response[PressedPageVersions] = {
    EmailFrontPath.fromPath(path).fold(pressFront(path))(pressEmailFront)
  }

  def pressFront(path: String)(implicit executionContext: ExecutionContext): Response[PressedPageVersions] = {
    for {
      config <- Response.Async.Right(fapiClient.config)
      collectionIds = collectionsIdsFromConfigForPath(path, config)
      pressedCollections <- Response.traverse(collectionIds.map(generateCollectionJsonFromFapiClient))
      seoWithProperties <- Response.Async.Right(getFrontSeoAndProperties(path))
    } yield seoWithProperties match {
      case (seoData, frontProperties) =>
        val webCollections = pressedCollections.filter(PressedCollectionVisibility.isWebCollection)

        val dedupliatedCollections = PressedCollectionVisibility.deduplication(webCollections)
          .map(_.pressedCollectionVersions)
          .toList
        PressedPageVersions.fromPressedCollections(path, seoData, frontProperties, dedupliatedCollections)
    }
  }

  def getFrontSeoAndProperties(path: String)(implicit executionContext: ExecutionContext): Future[(SeoData, FrontProperties)] =
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
