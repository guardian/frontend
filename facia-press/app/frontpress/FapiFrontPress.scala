package frontpress

import metrics.SamplerMetric
import com.gu.contentapi.client.{ContentApiClient => CapiContentApiClient}
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.model.{ItemQuery, SearchQuery}
import com.gu.contentatom.thrift.atom.media.{MediaAtom => AtomApiMediaAtom}
import com.gu.facia.api.contentapi.ContentApi.{AdjustItemQuery, AdjustSearchQuery}
import com.gu.facia.api.models.{Collection, Front}
import com.gu.facia.api.{FAPI, Response}
import com.gu.facia.client.ApiClient
import com.gu.facia.client.models.{Breaking, Canonical, ConfigJson, Metadata, Special}
import common.LoggingField.LogFieldString
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
import play.api.libs.ws.{WSClient, WSResponse}
import services.{ConfigAgent, S3FrontsApi}
import implicits.Booleans._
import layout.slices.Container
import model.content.MediaAtom

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

class LiveFapiFrontPress(val wsClient: WSClient, val capiClientForFrontsSeo: ContentApiClient)(implicit
    ec: ExecutionContext,
) extends FapiFrontPress {

  override def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit =
    S3FrontsApi.putLiveFapiPressedJson(path, json, pressedType)
  override def isLiveContent: Boolean = true

  override implicit val capiClient: CapiContentApiClient = CircuitBreakingContentApiClient(
    httpClient = new CapiHttpClient(wsClient),
    targetUrl = Configuration.contentApi.contentApiHost,
    apiKey = Configuration.contentApi.key.getOrElse("facia-press"),
  )

  implicit val fapiClient: ApiClient = FrontsApi.crossAccountClient

  override def collectionContentWithSnaps(
      collection: Collection,
      adjustSearchQuery: AdjustSearchQuery = identity,
      adjustSnapItemQuery: AdjustItemQuery = identity,
  ): Response[List[PressedContent]] =
    FAPI
      .liveCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery)
      .map(
        _.map((item) =>
          PressedContent.make(item, collection.collectionConfig.displayHints.flatMap(_.suppressImages).getOrElse(false)),
        ),
      )
}

class DraftFapiFrontPress(val wsClient: WSClient, val capiClientForFrontsSeo: ContentApiClient)(implicit
    ec: ExecutionContext,
) extends FapiFrontPress {

  override implicit val capiClient: CapiContentApiClient = CircuitBreakingContentApiClient(
    httpClient = new CapiHttpClient(wsClient) { override val signer = Some(PreviewSigner()) },
    targetUrl = Configuration.contentApi.previewHost
      .filter(_ => Switches.FaciaToolDraftContent.isSwitchedOn)
      .getOrElse(Configuration.contentApi.contentApiHost),
    apiKey = Configuration.contentApi.key.getOrElse("facia-press"),
  )

  implicit val fapiClient: ApiClient = FrontsApi.crossAccountClient

  override def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit =
    S3FrontsApi.putDraftFapiPressedJson(path, json, pressedType)
  override def isLiveContent: Boolean = false

  override def collectionContentWithSnaps(
      collection: Collection,
      adjustSearchQuery: AdjustSearchQuery = identity,
      adjustSnapItemQuery: AdjustItemQuery = identity,
  ): Response[List[PressedContent]] =
    FAPI
      .draftCollectionContentWithSnaps(collection, adjustSearchQuery, adjustSnapItemQuery)
      .map(
        _.map((item) =>
          PressedContent.make(item, collection.collectionConfig.displayHints.flatMap(_.suppressImages).getOrElse(false)),
        ),
      )
}

// This is the json structure we expect for an embed (know as a snap at render-time).
final case class EmbedJsonHtml(
    html: String,
)

object EmbedJsonHtml {
  implicit val format: OFormat[EmbedJsonHtml] = Json.format[EmbedJsonHtml]
}

case class EmailFrontPath(path: String, edition: String)

object EmailFrontPath {
  def fromPath(path: String): Option[EmailFrontPath] =
    path match {
      case "email/uk/daily"     => Some(EmailFrontPath(path, "uk"))
      case "email/us/daily"     => Some(EmailFrontPath(path, "us"))
      case "email/au/daily"     => Some(EmailFrontPath(path, "au"))
      case "email/europe/daily" => Some(EmailFrontPath(path, "europe"))
      case _                    => None
    }
}

case class EmailExtraCollections(
    canonical: Option[PressedCollectionVisibility],
    special: List[PressedCollectionVisibility],
    breaking: List[PressedCollectionVisibility],
)

trait EmailFrontPress extends GuLogging {

  implicit def fapiClient: ApiClient
  def generatePressedVersions(
      path: String,
      allPressedCollections: List[PressedCollectionVisibility],
      seoData: SeoData,
      frontProperties: FrontProperties,
  ): PressedPageVersions
  def collectionsIdsFromConfigForPath(path: String, config: ConfigJson): List[String]
  def generateCollectionJsonFromFapiClient(collectionId: String)(implicit
      executionContext: ExecutionContext,
  ): Response[PressedCollectionVisibility]
  def getFrontSeoAndProperties(path: String)(implicit
      executionContext: ExecutionContext,
  ): Future[(SeoData, FrontProperties)]

  def pressEmailFront(
      emailFrontPath: EmailFrontPath,
  )(implicit executionContext: ExecutionContext): Response[PressedPageVersions] = {
    for {
      config <- Response.Async.Right(fapiClient.config)
      collectionIds = collectionsIdsFromConfigForPath(emailFrontPath.path, config)
      pressedCollections <- Response.traverse(collectionIds.map(generateCollectionJsonFromFapiClient))
      extraEmailCollections <- buildExtraEmailCollections(emailFrontPath, config, pressedCollections)
      seoWithProperties <- Response.Async.Right(getFrontSeoAndProperties(emailFrontPath.path))
    } yield seoWithProperties match {
      case (seoData, frontProperties) =>
        val allPressedCollections =
          mergeExtraEmailCollections(pressedCollections, extraEmailCollections).map(_.withoutTrailTextOnTail)
        generatePressedVersions(emailFrontPath.path, allPressedCollections, seoData, frontProperties)
    }
  }

  private def mergeExtraEmailCollections(
      pressedCollections: List[PressedCollectionVisibility],
      emailCollections: EmailExtraCollections,
  ): List[PressedCollectionVisibility] = {
    emailCollections.breaking ::: emailCollections.canonical.toList ::: emailCollections.special ::: pressedCollections
  }

  private def buildExtraEmailCollections(
      frontPath: EmailFrontPath,
      config: ConfigJson,
      pressedCollections: List[PressedCollectionVisibility],
  )(implicit ec: ExecutionContext): Response[EmailExtraCollections] = {
    def findCollectionIds(metadata: Metadata): List[String] = {
      for {
        front <- config.fronts.get(frontPath.edition).toList
        collectionId <- front.collections
        collectionConfig <- config.collections.get(collectionId)
        if collectionConfig.metadata.exists(_.contains(metadata))
      } yield collectionId
    }

    def findMetaContainersWithLimit(metadata: Metadata, limit: Int): Response[List[PressedCollectionVisibility]] = {
      Response
        .traverse(findCollectionIds(metadata).map(generateCollectionJsonFromFapiClient))
        .map(_.map(_.withVisible(limit)))
    }

    val canonicalPressedF = findMetaContainersWithLimit(Canonical, 6)
    val breakingPressedF = findMetaContainersWithLimit(Breaking, 5)
    val specialPressedF = findMetaContainersWithLimit(Special, 1)

    for {
      canonicalPressed <- canonicalPressedF
      breakingPressed <- breakingPressedF
      specialPressed <- specialPressedF
    } yield EmailExtraCollections(canonicalPressed.headOption, specialPressed, breakingPressed)

  }

}

trait FapiFrontPress extends EmailFrontPress with GuLogging {

  val dependentFrontPaths: Map[String, Seq[String]] = Map(
    "uk" -> Seq("email/uk/daily"),
    "us" -> Seq("email/us/daily"),
    "au" -> Seq("email/au/daily"),
  )

  implicit val capiClient: CapiContentApiClient
  implicit def fapiClient: ApiClient
  val capiClientForFrontsSeo: ContentApiClient
  val wsClient: WSClient
  def putPressedJson(path: String, json: String, pressedType: PressedPageType): Unit
  def isLiveContent: Boolean

  def collectionContentWithSnaps(
      collection: Collection,
      adjustSearchQuery: AdjustSearchQuery = identity,
      adjustSnapItemQuery: AdjustItemQuery = identity,
  ): Response[List[PressedContent]]

  val showFields =
    "displayHint,trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalPageCode,main"
  val showBlocks = TrailsToRss.BlocksToGenerateRssIntro
  val searchApiQuery: AdjustSearchQuery = (searchQuery: SearchQuery) =>
    searchQuery
      .showSection(true)
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(QueryDefaults.references)
      .showAtoms("media")
      .showBlocks(showBlocks)

  val itemApiQuery: AdjustItemQuery = (itemQuery: ItemQuery) =>
    itemQuery
      .showSection(true)
      .showFields(showFields)
      .showElements("all")
      .showTags("all")
      .showReferences(QueryDefaults.references)
      .showAtoms("media")
      .showBlocks(showBlocks)

  def pressByPathId(path: String, messageId: String)(implicit executionContext: ExecutionContext): Future[Unit] = {
    def pressDependentPaths(paths: Seq[String]): Future[Unit] = {
      Future
        .traverse(paths)(p => pressPath(p, messageId))
        .recover { case e =>
          log.error(s"Error when pressing $paths", e)
        }
        .map(_ => ())
    }

    for {
      _ <- pressPath(path, messageId)
      _ <- pressDependentPaths(dependentFrontPaths.getOrElse(path, Nil))
    } yield ()
  }

  private def pressPath(path: String, messageId: String)(implicit executionContext: ExecutionContext): Future[Unit] = {
    val stopWatch: StopWatch = new StopWatch

    val pressFuture = getPressedFrontForPath(path)
      .map { pressedFronts: PressedPageVersions =>
        // temporary logging to investigate fronts weirdness on code - log entire front out
        if (Configuration.environment.stage == "CODE") {
          logInfoWithCustomFields(
            s"Pressed data for front $path : ${Json.stringify(Json.toJson(pressedFronts.full))} ",
            customFields = List(
              LogFieldString("messageId", messageId),
              LogFieldString("pressPath", path),
            ),
          )
        }
        putPressedPage(path, pressedFronts.full, FullType)
        putPressedPage(path, pressedFronts.lite, LiteType)
        putPressedPage(path, pressedFronts.fullAdFree, FullAdFreeType)
        putPressedPage(path, pressedFronts.liteAdFree, LiteAdFreeType)
      }
      .fold(
        e => {
          StatusNotification.notifyFailedJob(path, isLive = isLiveContent, e)
          e.cause.map(throw _).getOrElse(throw new RuntimeException(e.message))
        },
        _ => StatusNotification.notifyCompleteJob(path, isLive = isLiveContent),
      )

    pressFuture.onComplete {
      case Success(_) =>
        val pressDuration: Long = stopWatch.elapsed
        log.info(s"Successfully pressed $path in $pressDuration ms")
        FaciaPressMetrics.AllFrontsPressLatencyMetric.recordDuration(pressDuration.toDouble)

        /** We record separate metrics for each of the editions' network fronts */
        val metricsByPath = Map(
          "uk" -> FaciaPressMetrics.UkPressLatencyMetric,
          "us" -> FaciaPressMetrics.UsPressLatencyMetric,
          "au" -> FaciaPressMetrics.AuPressLatencyMetric,
        )
        if (Edition.byId(path).isDefined) {
          metricsByPath.get(path).foreach { metric =>
            metric.recordDuration(pressDuration.toDouble)
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
      case FullType       => FaciaPressMetrics.FrontPressContentSize
      case LiteType       => FaciaPressMetrics.FrontPressContentSizeLite
      case LiteAdFreeType => FaciaPressMetrics.FrontPressContentSizeLite
      case FullAdFreeType => FaciaPressMetrics.FrontPressContentSize
    }

    metric.recordSample(json.getBytes.length, new DateTime())
    putPressedJson(path, json, pressedType)
  }

  def generateCollectionJsonFromFapiClient(
      collectionId: String,
  )(implicit executionContext: ExecutionContext): Response[PressedCollectionVisibility] = {
    for {
      collection <- FAPI.getCollection(collectionId)
      curated <- getCurated(collection)
      backfill <- getBackfill(collection)
      treats <- getTreats(collection)
    } yield {
      val storyCountTotal = curated.length + backfill.length
      val storyCountMax: Int = collection.collectionConfig.collectionType match {
        // nav/list stories should never be capped
        case "nav/list" => storyCountTotal
        // scrollable feature containers are capped at 3 stories
        case "scrollable/feature" => 3
        // scrollable small containers are capped at 4 stories
        case "scrollable/small" => 4
        // scrollable highlights containers are capped at 6 stories
        case "scrollable/highlights" => 6
        // scrollable medium containers are capped at 8 stories
        case "scrollable/medium" => 8
        // flexible general containers have max items on each group. In order to know the total max items, we need to sum all of these together.
        case "flexible/general" => {

          collection.collectionConfig.groupsConfig
            .map(_.config)
            .getOrElse(Nil)
            .map(_.maxItems)
            .flatten // Removes None values as maxItems is optional
            .sum

        }
        // other container types should be capped at a maximum number of stories set in the app config
        case _ => Math.min(Configuration.facia.collectionCap, storyCountTotal)
      }
      val storyCountVisible = Container
        .storiesCount(
          CollectionConfig.make(collection.collectionConfig),
          curated ++ backfill,
        )
        .getOrElse(storyCountMax)

      val pressedCollection = pressCollection(collection, curated, backfill, treats, storyCountMax)
      PressedCollectionVisibility(pressedCollection, storyCountVisible)
    }
  }

  private def pressCollection(
      collection: Collection,
      curated: List[PressedContent],
      backfill: List[PressedContent],
      treats: List[PressedContent],
      storyCount: Int,
  ) = {
    val trimmedCurated = curated.take(storyCount)
    val trimmedBackfill = backfill.take(storyCount - trimmedCurated.length)
    PressedCollection.fromCollectionWithCuratedAndBackfill(
      collection,
      trimmedCurated,
      trimmedBackfill,
      treats,
    )
  }

  private def getCurated(
      collection: Collection,
  )(implicit executionContext: ExecutionContext): Response[List[PressedContent]] = {
    // Map initial PressedContent to enhanced content which contains pre-fetched embed content.
    val initialContent = collectionContentWithSnaps(collection, searchApiQuery, itemApiQuery)
    initialContent.flatMap { content =>
      Response.traverse(content.map {
        case curated: CuratedContent if FaciaInlineEmbeds.isSwitchedOn =>
          enrichContent(collection, curated, curated.enriched).map { updatedFields =>
            curated.copy(enriched = Some(updatedFields))
          }
          getMediaAtom(curated).map { mediaAtom =>
            curated.copy(mediaAtom = Some(mediaAtom))
          }
        case link: LinkSnap if FaciaInlineEmbeds.isSwitchedOn =>
          enrichContent(collection, link, link.enriched).map { updatedFields =>
            link.copy(enriched = Some(updatedFields))
          }
          getMediaAtom(link).map { mediaAtom =>
            link.copy(mediaAtom = Some(mediaAtom))
          }
        case plain => Response.Right(plain)
      })
    }
  }

  private def enrichContent(collection: Collection, content: PressedContent, enriched: Option[EnrichedContent])(implicit
      executionContext: ExecutionContext,
  ): Response[EnrichedContent] = {
    val beforeEnrichment = enriched.getOrElse(EnrichedContent.empty)

    val maybeUpdate = content.properties.embedType match {
      case Some("json.html") =>
        Enrichment.enrichSnap(content.properties.embedUri, beforeEnrichment, collection, wsClient)
      case Some("interactive") =>
        Enrichment.enrichInteractive(content.properties.atomId, beforeEnrichment, collection, capiClient)
      case _ => Future.successful(beforeEnrichment)
    }

    Response(maybeUpdate.map(scala.Right.apply))
  }

  private def getMediaAtom(
      content: PressedContent,
  )(implicit executionContext: ExecutionContext): Response[MediaAtom] = {

    val maybeUpdate = content.properties match {
      case properties if properties.mediaSelect.videoReplace && properties.replacementVideoAtomId.isDefined =>
        Enrichment.enrichVideo(properties.replacementVideoAtomId, capiClient)
      case properties if properties.mediaSelect.showMainVideo =>
        Enrichment.asFut(
          for {
            content <- content.properties.maybeContent
            elements = content.elements
            atom = elements.mediaAtoms.head if elements.mainMediaAtom.isDefined && elements.mediaAtoms.nonEmpty
          } yield atom,
          "failed to extract main media atom",
        )
      case _ => Enrichment.asFut(None, "no media atom available")
    }

    Response(maybeUpdate.map(scala.Right.apply))
  }

  private def getTreats(
      collection: Collection,
  )(implicit executionContext: ExecutionContext): Response[List[PressedContent]] = {
    FAPI
      .getTreatsForCollection(collection, searchApiQuery, itemApiQuery)
      .map(_.map((item) => PressedContent.make(item, false)))
  }

  private def getBackfill(
      collection: Collection,
  )(implicit executionContext: ExecutionContext): Response[List[PressedContent]] = {
    FAPI
      .backfillFromConfig(collection.collectionConfig, searchApiQuery, itemApiQuery)
      .map(_.map(((item) => PressedContent.make(item, false))))
  }

  def generatePressedVersions(
      path: String,
      allPressedCollections: List[PressedCollectionVisibility],
      seoData: SeoData,
      frontProperties: FrontProperties,
  ): PressedPageVersions = {
    val webCollections = allPressedCollections.filter(PressedCollectionVisibility.isWebCollection)
    val deduplicatedCollections = PressedCollectionDeduplication
      .deduplication(webCollections)
      .map(_.pressedCollectionVersions)
      .toList
    PressedPageVersions.fromPressedCollections(path, seoData, frontProperties, deduplicatedCollections)
  }

  def collectionsIdsFromConfigForPath(path: String, config: ConfigJson): List[String] = {
    Front
      .frontsFromConfig(config)
      .find(_.id == path)
      .map(_.collections)
      .getOrElse {
        log.warn(s"There are no collections for path $path")
        throw new IllegalStateException(s"There are no collections for path $path")
      }
  }

  def getPressedFrontForPath(
      path: String,
  )(implicit executionContext: ExecutionContext): Response[PressedPageVersions] = {
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
        generatePressedVersions(path, pressedCollections, seoData, frontProperties)
    }
  }

  def getFrontSeoAndProperties(
      path: String,
  )(implicit executionContext: ExecutionContext): Future[(SeoData, FrontProperties)] = {

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

      val frontProperties: FrontProperties = ConfigAgent
        .getFrontProperties(path)
        .copy(
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
          },
        )

      val seoData: SeoData = SeoData(path, navSection, webTitle, title, description)
      (seoData, frontProperties)
    }
  }

  private def getNavSectionFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag
      .flatMap(_.sectionId)
      .orElse(itemResponse.section.map(_.id).map(removeLeadEditionFromSectionId))

  private def getWebTitleFromItemResponse(itemResponse: ItemResponse): Option[String] =
    itemResponse.tag
      .map(_.webTitle)
      .orElse(itemResponse.section.map(_.webTitle))

  // This will turn au/culture into culture. We want to stay consistent with the manual entry and autogeneration
  private def removeLeadEditionFromSectionId(sectionId: String): String =
    sectionId.split('/').toList match {
      case edition :: tail if Edition.byId(edition).isDefined => tail.mkString("/")
      case _                                                  => sectionId
    }

  private def getCapiItemResponseForPath(
      id: String,
  )(implicit executionContext: ExecutionContext): Future[Option[ItemResponse]] = {
    val contentApiResponse: Future[ItemResponse] = capiClientForFrontsSeo.getResponse(
      capiClientForFrontsSeo
        .item(id, Edition.defaultEdition)
        .showEditorsPicks(false)
        .pageSize(0),
    )

    contentApiResponse.foreach { _ =>
      log.info(s"Getting SEO data from content API for $id")
    }

    contentApiResponse.failed.foreach { e: Throwable =>
      log.warn(s"Error getting SEO data from content API for $id: $e")
    }

    contentApiResponse.map(Option(_)).fallbackTo(Future.successful(None))
  }
}

object Enrichment extends GuLogging {
  def enrichSnap(
      embedUri: Option[String],
      beforeEnrichment: EnrichedContent,
      collection: Collection,
      wsClient: WSClient,
  )(implicit executionContext: ExecutionContext): Future[EnrichedContent] = {

    def enrich(response: WSResponse): Option[EnrichedContent] = {
      val jsResult = Json.fromJson[EmbedJsonHtml](response.json)

      val jsOption = jsResult match {
        case JsSuccess(embed, _) => Some(embed)
        case _                   => None
      }

      jsOption.map { embed =>
        beforeEnrichment.copy(embedHtml = Some(embed.html))
      }
    }

    val result = for {
      embedUri <- asFut(embedUri, "missing embedUri")
      response <- wsClient.url(embedUri).get()
      enriched <- asFut(enrich(response), s"failed to enrich snap $embedUri")
    } yield enriched

    result.recover {
      case error => {
        log.warn(s"Processing a snap failed, skipping: ${error.toString()}")
        beforeEnrichment
      }
    }
  }

  def enrichVideo(
      atomId: Option[String],
      capiClient: CapiContentApiClient,
  )(implicit executionContext: ExecutionContext): Future[MediaAtom] = {
    def enrich(response: ItemResponse): Option[MediaAtom] = {
      for {
        video <- response.media
        enriched <- Some(video.data).flatMap {
          case atom: com.gu.contentatom.thrift.AtomData.Media =>
            Some(
              MediaAtom.mediaAtomMake(
                video.id,
                video.defaultHtml,
                video.data.asInstanceOf[AtomApiMediaAtom],
              ),
            )
          case _ => None
        }
      } yield enriched
    }

    val result = for {
      atomId <- asFut(atomId, "atomId was undefined")
      itemResponse <- capiClient.getResponse(ItemQuery(atomId))
      enriched <- asFut(enrich(itemResponse), s"failed to enrich media atom $atomId")
    } yield enriched

    result.failed.foreach { error =>
      val msg = s"Processing of a video atom failed, and it won't be pressed: $error"
      log.warn(msg)
    }

    result
  }

  def enrichInteractive(
      atomId: Option[String],
      beforeEnrichment: EnrichedContent,
      collection: Collection,
      capiClient: CapiContentApiClient,
  )(implicit executionContext: ExecutionContext): Future[EnrichedContent] = {

    def enrich(response: ItemResponse): Option[EnrichedContent] = {
      for {
        interactive <- response.interactive
        enriched <- Some(interactive.data).flatMap {
          case atom: com.gu.contentatom.thrift.AtomData.Interactive =>
            Some(
              beforeEnrichment.copy(
                embedHtml = Some(atom.interactive.html),
                embedCss = Some(atom.interactive.css),
                embedJs = atom.interactive.mainJS,
              ),
            )
          case _ => None
        }
      } yield enriched
    }

    val result = for {
      atomId <- asFut(atomId, "atomId was undefined")
      itemResponse <- capiClient.getResponse(ItemQuery(atomId))
      enriched <- asFut(enrich(itemResponse), s"failed to enrich atom $atomId")
    } yield enriched

    result.failed.foreach { error =>
      val msg = s"Processing of an interactive atom failed, and it won't be pressed: $error"
      log.warn(msg)
    }

    result
  }

  def asFut[A](opt: Option[A], errMsg: String): Future[A] = {
    opt match {
      case Some(thing) => Future.successful(thing)
      case None        => Future.failed(new Throwable(errMsg))
    }
  }
}
