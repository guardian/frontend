package controllers

import _root_.html.{BrazeEmailFormatter, HtmlTextExtractor}
import agents.{DeeplyReadAgent, MostViewedAgent}
import common._
import conf.Configuration
import conf.switches.Switches.InlineEmailStyles
import controllers.front._
import experiments.{ActiveExperiments, EuropeBetaFront}
import http.HttpPreconnections
import implicits.GUHeaders
import layout.slices._
import layout._
import model.Cached.{CacheableResult, RevalidatableResult, WithoutRevalidationResult}
import model._
import model.dotcomrendering.{DotcomFrontsRenderingDataModel, PageType}
import model.facia.PressedCollection
import model.pressed.CollectionConfig
import net.logstash.logback.marker.Markers.append
import pages.{FrontEmailHtmlPage, FrontHtmlPage}
import play.api.libs.json._
import play.api.libs.ws.WSClient
import play.api.mvc._
import play.twirl.api.Html
import renderers.DotcomRenderingService
import services.dotcomrendering.{FaciaPicker, RemoteRender}
import services.fronts.{FrontJsonFapi, FrontJsonFapiLive}
import services.{CollectionConfigWithId, ConfigAgent}
import utils.TargetedCollections
import views.html.fragments.containers.facia_cards.container
import views.support.FaciaToMicroFormat2Helpers.getCollection

import scala.concurrent.Future
import scala.concurrent.Future.successful

trait FaciaController
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with implicits.Requests {

  val frontJsonFapi: FrontJsonFapi
  val ws: WSClient
  val mostViewedAgent: MostViewedAgent
  val deeplyReadAgent: DeeplyReadAgent
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()
  val assets: Assets

  implicit val context: ApplicationContext

  def applicationsRedirect(path: String)(implicit request: RequestHeader): Future[Result] = {
    val redirectPath = if (request.isJson) s"$path.json" else path
    successful(
      InternalRedirect.internalRedirect("applications", redirectPath, request.rawQueryStringOption.map("?" + _)),
    )
  }

  def rssRedirect(path: String)(implicit request: RequestHeader): Future[Result] = {
    successful(
      InternalRedirect.internalRedirect(
        "rss_server",
        path,
        request.rawQueryStringOption.map("?" + _),
      ),
    )
  }

  // ApplePay MerchantId
  def appleDeveloperMerchantId(): Action[AnyContent] =
    if (Configuration.environment.isProd)
      assets.at(path = "/public", file = "apple-developer-merchantid-domain-association-prod.txt")
    else
      assets.at(path = "/public", file = "apple-developer-merchantid-domain-association-code.txt")

  // Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
  def renderFrontPressSpecial(path: String): Action[AnyContent] =
    Action.async { implicit request => renderFrontPressResult(path) }

  // Needed as aliases for reverse routing
  def renderFrontJson(id: String): Action[AnyContent] = renderFront(id)

  def renderContainerJson(id: String): Action[AnyContent] = renderContainer(id, false)

  def renderContainerDataJson(id: String): Action[AnyContent] =
    Action.async { implicit request =>
      getPressedCollection(id).map {
        case Some(collection) =>
          val onwardItems = OnwardCollection.pressedCollectionToOnwardCollection(collection)

          Cached(CacheTime.Facia) {
            JsonComponent.fromWritable(onwardItems)
          }
        case None =>
          Cached(CacheTime.NotFound)(
            WithoutRevalidationResult(NotFound(s"collection id $id does not exist")),
          )
      }
    }

  def renderSomeFrontContainersMf2(
      count: Int,
      offset: Int,
      section: String = "",
  ): Action[AnyContent] =
    Action.async { implicit request =>
      val e = Edition(request)
      val collectionsPath = if (section.isEmpty) e.id.toLowerCase else Editionalise(section, e)
      getSomeCollections(collectionsPath, count, offset, "none").map { collections =>
        Cached(CacheTime.Facia) {
          JsonComponent(
            "items" -> JsArray(collections.map(getCollection)),
          )
        }
      }

    }

  def renderContainerJsonWithFrontsLayout(id: String): Action[AnyContent] = renderContainer(id, true)

  // Needed as aliases for reverse routing
  def renderRootFrontRss(): Action[AnyContent] = renderFrontRss(path = "")
  def renderFrontRss(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (shouldEditionRedirect(path))
        redirectTo(s"${Editionalise(path, Edition(request))}/rss")
      else if (!ConfigAgent.shouldServeFront(path))
        rssRedirect(s"$path/rss")
      else
        renderFrontPressResult(path)
    }

  def rootEditionRedirect(): Action[AnyContent] = renderFront(path = "")

  def renderFrontHeadline(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      def notFound() = {
        FrontHeadline.headlineNotFound
      }

      if (!ConfigAgent.frontExistsInConfig(path)) {
        successful(Cached(CacheTime.Facia)(notFound()))
      } else {
        frontJsonFapi
          .get(path, liteRequestType)
          .map(_.fold[CacheableResult](notFound())(FrontHeadline.renderEmailHeadline))
          .map(Cached(CacheTime.Facia))
      }

    }

  def renderFront(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (shouldEditionRedirect(path))
        redirectTo(Editionalise(path, Edition(request)))
      else if (!ConfigAgent.shouldServeFront(path) || request.getQueryString("page").isDefined) {
        applicationsRedirect(path)
      } else
        renderFrontPressResult(path)
    }

  private def shouldEditionRedirect(path: String)(implicit request: RequestHeader): Boolean = {
    val editionalisedPath = Editionalise(path, Edition(request))
    (editionalisedPath != path) && request.getQueryString("page").isEmpty
  }

  def redirectTo(path: String)(implicit request: RequestHeader): Future[Result] =
    successful {
      val params = request.rawQueryStringOption.map(q => s"?$q").getOrElse("")
      Cached(CacheTime.Facia)(WithoutRevalidationResult(Found(LinkTo(s"/$path$params"))))
    }

  // Returns a stripped-down 'minimal' version of the 'lite' version of a PressedPage.
  // The minimal version of a Front contains only the `webTitle` and `collections`
  // from that Front. Some content items are filtered out (e.g. LinkSnaps) and some fields
  // are renamed.
  // It's used by a number of services, including the 'pressreader' edition feed,
  // see https://github.com/guardian/pressreader
  def renderFrontJsonMinimal(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!ConfigAgent.frontExistsInConfig(path)) {
        successful(
          Cached(CacheTime.Facia)(JsonComponent.fromWritable(JsObject(Nil))),
        )
      } else {
        frontJsonFapi.get(path, liteRequestType).map { resp =>
          Cached(CacheTime.Facia)(JsonComponent.fromWritable(resp match {
            case Some(pressedPage) => FapiFrontJsonMinimal.get(pressedPage)
            case None              => JsObject(Nil)
          }))
        }
      }
    }

  private def nonHtmlEmail(request: RequestHeader) =
    (request.isEmail && request.isHeadlineText) || request.isEmailJson || request.isEmailTxt

  // setting Vary header can be expensive (https://www.fastly.com/blog/best-practices-using-vary-header)
  // only set it for fronts with targeted collections
  private def withVaryHeader(result: Future[Result], targetedTerritories: Boolean) =
    if (targetedTerritories) {
      result.map(_.withHeaders(("Vary", GUHeaders.TERRITORY_HEADER)))
    } else result

  private def resultWithVaryHeader(result: CacheableResult, targetedTerritories: Boolean)(implicit
      request: RequestHeader,
  ) =
    withVaryHeader(successful(Cached(CacheTime.Facia)(result)), targetedTerritories)

  private def resultWithVaryAndPreloadHeader(result: CacheableResult, targetedTerritories: Boolean)(implicit
      request: RequestHeader,
  ) =
    withVaryHeader(
      successful(
        Cached(CacheTime.Facia)(result)
          .withPreload(
            Preload.config(request).getOrElse(context.applicationIdentity, Seq.empty),
          )(context, request)
          .withPreconnect(HttpPreconnections.defaultUrls),
      ),
      targetedTerritories,
    )

  private[controllers] def renderFrontPressResult(path: String)(implicit request: RequestHeader): Future[Result] = {
    val futureFaciaPage = getFaciaPage(path)

    /** Europe Beta test: swaps the collections on the Europe network front with those on the hidden europe-beta front
      * for users participating in the test
      */
    val futureFaciaPageWithEuropeBetaTest: Future[Option[(PressedPage, Boolean)]] = {
      if (
        path == "europe" && ActiveExperiments
          .isParticipating(EuropeBetaFront)
      ) {
        val futureEuropeBetaPage = getFaciaPage("europe-beta")
        for {
          europePage <- futureFaciaPage
          europeBetaPage <- futureEuropeBetaPage
        } yield replaceFaciaPageCollections(europePage, europeBetaPage)
      } else {
        futureFaciaPage
      }
    }

    val customLogFieldMarker = append("requestId", request.headers.get("x-gu-xid").getOrElse("request-id-not-provided"))

    val networkFrontEdition = Edition.allEditions.find(_.networkFrontId == path)
    val deeplyRead = networkFrontEdition.map(deeplyReadAgent.getTrails)

    val futureResult = futureFaciaPageWithEuropeBetaTest.flatMap {
      case Some((faciaPage, _)) if nonHtmlEmail(request) =>
        successful(Cached(CacheTime.RecentlyUpdated)(renderEmail(faciaPage)))
      case Some((faciaPage: PressedPage, targetedTerritories))
          if FaciaPicker.getTier(faciaPage) == RemoteRender
            && !request.isJson =>
        val pageType = PageType(faciaPage, request, context)

        logInfoWithRequestId(
          s"Front Geo Request (212): ${Edition(request).id} ${request.headers.toSimpleMap.getOrElse("X-GU-GeoLocation", "country:row")}",
        )
        withVaryHeader(
          remoteRenderer.getFront(
            ws = ws,
            page = faciaPage,
            pageType = pageType,
            mostViewed = mostViewedAgent.mostViewed(Edition(request)),
            mostCommented = mostViewedAgent.mostCommented,
            mostShared = mostViewedAgent.mostShared,
            deeplyRead = deeplyRead,
          )(request),
          targetedTerritories,
        )
      case Some((faciaPage: PressedPage, targetedTerritories)) if request.isRss =>
        val body = TrailsToRss.fromPressedPage(faciaPage)

        withVaryHeader(
          successful(Cached(CacheTime.Facia)(RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body))),
          targetedTerritories,
        )
      case Some((faciaPage: PressedPage, targetedTerritories)) if request.isJson =>
        val result = if (request.forceDCR) {
          logInfoWithRequestId(
            s"Front Geo Request (237): ${Edition(request).id} ${request.headers.toSimpleMap.getOrElse("X-GU-GeoLocation", "country:row")}",
          )
          JsonComponent.fromWritable(
            DotcomFrontsRenderingDataModel(
              page = faciaPage,
              request = request,
              pageType = PageType(faciaPage, request, context),
              mostViewed = mostViewedAgent.mostViewed(Edition(request)),
              mostCommented = mostViewedAgent.mostCommented,
              mostShared = mostViewedAgent.mostShared,
              deeplyRead = deeplyRead,
            ),
          )
        } else JsonFront(faciaPage)
        resultWithVaryHeader(result, targetedTerritories)
      case Some((faciaPage: PressedPage, targetedTerritories)) if request.isEmail || ConfigAgent.isEmailFront(path) =>
        resultWithVaryHeader(renderEmail(faciaPage), targetedTerritories)
      case Some((faciaPage: PressedPage, targetedTerritories)) if TrailsToShowcase.isShowcaseFront(faciaPage) =>
        resultWithVaryHeader(renderShowcaseFront(faciaPage), targetedTerritories)
      case Some((faciaPage: PressedPage, targetedTerritories)) =>
        resultWithVaryAndPreloadHeader(RevalidatableResult.Ok(FrontHtmlPage.html(faciaPage)), targetedTerritories)
      case None => {
        successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
      }
    }

    futureResult.failed.foreach { t: Throwable => logErrorWithRequestId(s"Failed rendering $path with $t", t) }
    futureResult
  }

  import PressedPage.pressedPageFormat

  /** Fetches facia page for path */
  private[controllers] def getFaciaPage(path: String)(implicit
      request: RequestHeader,
  ): Future[Option[(PressedPage, Boolean)]] = frontJsonFapi.get(path, liteRequestType).flatMap {
    case Some(faciaPage: PressedPage) if faciaPage.collections.isEmpty && liteRequestType == LiteAdFreeType =>
      frontJsonFapi.get(path, LiteType).map(_.map(f => (f, false)))
    case Some(faciaPage: PressedPage) =>
      val pageContainsTargetedCollections = TargetedCollections.pageContainsTargetedCollections(faciaPage)
      val regionalFaciaPage = TargetedCollections.processTargetedCollections(
        faciaPage,
        request.territories,
        context.isPreview,
        pageContainsTargetedCollections,
      )
      if (conf.Configuration.environment.stage == "CODE") {
        logInfoWithCustomFields(
          s"Rendering front $path, frontjson: ${Json.stringify(Json.toJson(faciaPage)(pressedPageFormat))}",
          List(),
        )
      }
      Future.successful(Some(regionalFaciaPage, pageContainsTargetedCollections))
    case None => Future.successful(None)
  }

  /** Swaps collections on a given facia page with those on another facia page. Set up for the Europe beta test where we
    * return europe-beta collections on the europe front if participating in the test
    */
  private[controllers] def replaceFaciaPageCollections(
      baseFaciaPage: Option[(PressedPage, Boolean)],
      replacementFaciaPage: Option[(PressedPage, Boolean)],
  ): Option[(PressedPage, Boolean)] = {
    for {
      (basePage, _) <- baseFaciaPage
      (replacementPage, replacementTargetedTerritories) <- replacementFaciaPage
    } yield (
      PressedPage(
        id = basePage.id,
        seoData = basePage.seoData,
        frontProperties = basePage.frontProperties,
        collections = replacementPage.collections,
      ),
      replacementTargetedTerritories,
    )
  }

  private def renderEmail(faciaPage: PressedPage)(implicit request: RequestHeader) = {
    if (request.isHeadlineText) {
      FrontHeadline.renderEmailHeadline(faciaPage)
    } else {
      renderEmailFront(faciaPage)
    }
  }

  private def renderEmailFront(faciaPage: PressedPage)(implicit request: RequestHeader) = {
    val htmlResponse = FrontEmailHtmlPage.html(faciaPage)
    val htmResponseInlined = if (InlineEmailStyles.isSwitchedOn) InlineStyles(htmlResponse) else htmlResponse

    if (request.isEmailJson) {
      val htmlWithUtmLinks = BrazeEmailFormatter(htmResponseInlined)
      val emailJson = JsObject(Map("body" -> JsString(htmlWithUtmLinks.toString)))
      RevalidatableResult.Ok(emailJson)
    } else if (request.isEmailTxt) {
      val htmlWithUtmLinks = BrazeEmailFormatter(htmResponseInlined)
      val emailTxtJson = JsObject(Map("body" -> JsString(HtmlTextExtractor(htmlWithUtmLinks))))
      RevalidatableResult.Ok(emailTxtJson)
    } else {
      RevalidatableResult.Ok(htmResponseInlined)
    }
  }

  protected def renderShowcaseFront(faciaPage: PressedPage)(implicit request: RequestHeader): RevalidatableResult = {
    val (rundownPanelOutcome, singleStoryPanelOutcomes, duplicateMap) = TrailsToShowcase.generatePanelsFrom(faciaPage)
    val showcase = TrailsToShowcase(
      feedTitle = faciaPage.metadata.title,
      url = Some(faciaPage.metadata.url),
      description = faciaPage.metadata.description,
      singleStoryPanels = singleStoryPanelOutcomes.flatMap(_.toOption),
      maybeRundownPanel = rundownPanelOutcome.toOption,
    )
    // Google doesn't like <dc:date> elements in the showcase feed so we're going to remove them with a
    // tightly-focussed regex replacement. The <dc:date> values are added in the depths of the Rome
    // library which is not easy to intercept at that point. We can use this technique until we can figure
    // out a better way. In the meantime it'll stop the validator from complaining at us.
    val dcDateRegEx = """<dc:date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d+Z</dc:date>""".r
    val showcaseWithoutDcDates = dcDateRegEx.replaceAllIn(showcase, "")
    RevalidatableResult(Ok(showcaseWithoutDcDates).as("text/xml; charset=utf-8"), showcaseWithoutDcDates)
  }

  // Used by dev-build only
  def renderFrontPress(path: String): Action[AnyContent] =
    Action.async { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String, preserveLayout: Boolean = false): Action[AnyContent] =
    Action.async { implicit request =>
      renderContainerView(id, preserveLayout)
    }

  private def renderContainerView(collectionId: String, preserveLayout: Boolean = false)(implicit
      request: RequestHeader,
  ): Future[Result] = {
    getPressedCollection(collectionId).map { collectionOption =>
      collectionOption
        .map { collection =>
          val config = ConfigAgent.getConfig(collectionId).getOrElse(CollectionConfig.empty)

          val containerLayout = {
            if (preserveLayout)
              Container.resolve(collection.collectionType)
            else
              Fixed(FixedContainers.fixedSmallSlowVI)
          }

          val containerDefinition = FaciaContainer.fromConfigWithId(
            1,
            containerLayout,
            CollectionConfigWithId(collectionId, config),
            CollectionEssentials.fromPressedCollection(collection),
            hasMore = false,
          )

          val html = container(containerDefinition, FrontProperties.empty)
          if (request.isJson)
            Cached(CacheTime.Facia) { JsonCollection(html) }
          else
            Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound("containers are only available as json")))
        }
        .getOrElse(
          Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound(s"collection id $collectionId does not exist"))),
        )
    }
  }

  def checkIfPaid(faciaCard: FaciaCard): Boolean = {
    faciaCard match {
      case c: ContentCard => c.properties.exists(_.isPaidFor)
      case _              => false
    }
  }

  def renderShowMore(path: String, collectionId: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (!ConfigAgent.frontExistsInConfig(path)) {
        successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
      } else {
        frontJsonFapi.get(path, fullRequestType).flatMap {
          case Some(pressedPage) if request.forceDCR =>
            val maybeResponse = for {
              collection <- pressedPage.collections.find(_.id == collectionId)
            } yield {
              successful(Cached(CacheTime.Facia) {
                val cards = collection.curated ++ collection.backfill

                val adFreeFilteredCards = cards.filter(c => !(c.properties.isPaidFor && request.isAdFree))

                implicit val pressedContentFormat = PressedContentFormat.format
                JsonComponent.fromWritable(Json.toJson(adFreeFilteredCards))
              })
            }
            maybeResponse.getOrElse { successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))) }
          case Some(pressedPage) =>
            val containers = Front.fromPressedPage(pressedPage, Edition(request), adFree = request.isAdFree).containers
            val maybeResponse =
              for {
                (container, index) <- containers.zipWithIndex.find(_._1.dataId == collectionId)
                containerLayout <- container.containerLayout
              } yield {
                val remainingCards: Seq[FaciaCardAndIndex] = containerLayout.remainingCards.map(_.withFromShowMore)
                val adFreeFilteredCards: Seq[FaciaCardAndIndex] = if (request.isAdFree) {
                  remainingCards.filter(c => !checkIfPaid(c.item))
                } else {
                  remainingCards
                }
                successful(Cached(CacheTime.Facia) {
                  JsonComponent(views.html.fragments.containers.facia_cards.showMore(adFreeFilteredCards, index))
                })
              }

            maybeResponse getOrElse successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
          case None => successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
        }
      }
    }

  private object JsonCollection {
    def apply(html: Html)(implicit request: RequestHeader): RevalidatableResult = JsonComponent(html)
  }

  private object JsonFront {
    def apply(faciaPage: PressedPage)(implicit request: RequestHeader): RevalidatableResult =
      JsonComponent(
        "html" -> views.html.fragments.frontBody(faciaPage),
        "config" -> Json.parse(templates.js.javaScriptConfig(faciaPage).body),
      )
  }

  /** Note, the way this method works is a bit circuitous. Firstly, it finds a front that contains the collection (via
    * the ConfigAgent, which is basically a cache of configuration for Guardian Fronts). It then looks up that front in
    * Frontend's S3 and extracts the full collection from it (with curated and backfill content etc.). It would be
    * easier if collections were stored somewhere independently of Fronts.
    */
  private def getPressedCollection(
      collectionId: String,
  )(implicit request: RequestHeader): Future[Option[PressedCollection]] =
    ConfigAgent
      .getConfigsUsingCollectionId(collectionId)
      .headOption
      .map { path =>
        frontJsonFapi
          .get(path, fullRequestType)
          .map(_.flatMap { faciaPage =>
            faciaPage.collections.find { c => c.id == collectionId }
          })
      }
      .getOrElse(successful(None))

  private def getSomeCollections(path: String, num: Int, offset: Int = 0, containerNameToFilter: String)(implicit
      requestHeader: RequestHeader,
  ): Future[List[PressedCollection]] =
    frontJsonFapi.get(path, fullRequestType).map { maybePage =>
      maybePage
        .map { faciaPage =>
          // To-do: change the filter to only exclude thrashers and empty collections, not items such as the big picture
          faciaPage.collections
            .filterNot { collection =>
              (collection.curated ++ collection.backfill).length < 2 ||
              collection.displayName == "most popular" ||
              collection.displayName.toLowerCase.contains(containerNameToFilter.toLowerCase)
            }
            .slice(offset, offset + num)
        }
        .getOrElse(Nil)
    }

  /* Google news hits this endpoint */
  def renderCollectionRss(id: String): Action[AnyContent] =
    Action.async { implicit request =>
      getPressedCollection(id).flatMap {
        case Some(collection) =>
          successful {
            Cached(CacheTime.Facia) {
              val config: CollectionConfig = ConfigAgent.getConfig(id).getOrElse(CollectionConfig.empty)
              val webTitle = config.displayName.getOrElse("The Guardian")
              val body = TrailsToRss.fromFaciaContent(
                webTitle,
                collection.curatedPlusBackfillDeduplicated.flatMap(_.properties.maybeContent),
                "",
                None,
              )
              RevalidatableResult(Ok(body).as("text/xml; charset=utf8"), body)
            }
          }
        case None => successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
      }
    }

  def renderAgentContents: Action[AnyContent] =
    Action {
      Ok(ConfigAgent.contentsAsJsonString)
    }

  def fullRequestType(implicit request: RequestHeader): PressedPageType =
    if (request.isAdFree) FullAdFreeType else FullType
  def liteRequestType(implicit request: RequestHeader): PressedPageType =
    if (request.isAdFree) LiteAdFreeType else LiteType

  def ampRsaPublicKey: Action[AnyContent] = {
    Action {
      // The private key is in the CAPI account, see the documentation at https://github.com/guardian/fastly-cache-purger
      Ok(Configuration.amp.flushPublicKey).as("text/plain")
    }
  }
}

class FaciaControllerImpl(
    val frontJsonFapi: FrontJsonFapiLive,
    val controllerComponents: ControllerComponents,
    val ws: WSClient,
    val mostViewedAgent: MostViewedAgent,
    val deeplyReadAgent: DeeplyReadAgent,
    val assets: Assets,
)(implicit val context: ApplicationContext)
    extends FaciaController
