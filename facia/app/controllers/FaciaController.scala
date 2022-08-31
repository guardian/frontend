package controllers

import common._
import _root_.html.{BrazeEmailFormatter, HtmlTextExtractor}
import controllers.front._
import layout.{CollectionEssentials, ContentCard, FaciaCard, FaciaCardAndIndex, FaciaContainer, Front}
import model.Cached.{CacheableResult, RevalidatableResult, WithoutRevalidationResult}
import model._
import model.facia.PressedCollection
import model.pressed.CollectionConfig
import play.api.libs.json._
import play.api.mvc._
import play.twirl.api.Html
import services.{CollectionConfigWithId, ConfigAgent}
import layout.slices._
import views.html.fragments.containers.facia_cards.container
import views.support.FaciaToMicroFormat2Helpers.getCollection
import conf.switches.Switches.InlineEmailStyles
import implicits.GUHeaders
import pages.{FrontEmailHtmlPage, FrontHtmlPage}
import utils.{FaciaPicker, RemoteRender, TargetedCollections}
import conf.Configuration
import play.api.libs.ws.WSClient
import renderers.DotcomRenderingService
import model.dotcomrendering.{DotcomFrontsRenderingDataModel, PageType}

import scala.concurrent.Future
import scala.concurrent.Future.successful
import experiments.{ActiveExperiments, EuropeNetworkFront}


trait FaciaController
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext
    with implicits.Requests {

  val frontJsonFapi: FrontJsonFapi
  val ws: WSClient
  val remoteRenderer: DotcomRenderingService = DotcomRenderingService()

  implicit val context: ApplicationContext

  private def getEditionFromString(edition: String): Edition = {
    val editionToFilterBy = edition match {
      case "international" => "int"
      case "europe"        => "eur"
      case _               => edition
    }
    Edition.allWithEurope.find(_.id.toLowerCase() == editionToFilterBy).getOrElse(Edition.allWithEurope.head)
  }

  def applicationsRedirect(path: String)(implicit request: RequestHeader): Future[Result] = {
    successful(InternalRedirect.internalRedirect("applications", path, request.rawQueryStringOption.map("?" + _)))
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

  //Only used by dev-build for rending special urls such as lifeandstyle/home-and-garden
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
      edition: String = "",
  ): Action[AnyContent] =
    Action.async { implicit request =>
      val e = if (edition.isEmpty) Edition(request) else getEditionFromString(edition)
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

      frontJsonFapi
        .get(path, liteRequestType)
        .map(_.fold[CacheableResult](notFound())(FrontHeadline.renderEmailHeadline))
        .map(Cached(CacheTime.Facia))
    }

  def renderFront(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      if (shouldEditionRedirect(path))
        redirectTo(Editionalise(path, Edition(request)))
      else if (!ConfigAgent.shouldServeFront(path) || request.getQueryString("page").isDefined)
        applicationsRedirect(path)
      else
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

  def renderFrontJsonLite(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      frontJsonFapi.get(path, liteRequestType).map { resp =>
        Cached(CacheTime.Facia)(JsonComponent.fromWritable(resp match {
          case Some(pressedPage) => FapiFrontJsonLite.get(pressedPage)
          case None              => JsObject(Nil)
        }))
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

  import PressedPage.pressedPageFormat
  private[controllers] def renderFrontPressResult(path: String)(implicit request: RequestHeader): Future[Result] = {
    val participatingInTest = ActiveExperiments.isParticipating(EuropeNetworkFront)
    if (!participatingInTest && path == "europe") {
      return successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
    }
    val futureFaciaPage: Future[Option[(PressedPage, Boolean)]] = frontJsonFapi.get(path, liteRequestType).flatMap {
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
        if (faciaPage.collections.isEmpty && liteRequestType == LiteAdFreeType) {
          frontJsonFapi.get(path, LiteType).map(_.map(f => (f, false)))
        } else Future.successful(Some(regionalFaciaPage, pageContainsTargetedCollections))
      case None => Future.successful(None)
    }

    val futureResult = futureFaciaPage.flatMap {
      case Some((faciaPage, _)) if nonHtmlEmail(request) =>
        successful(Cached(CacheTime.RecentlyUpdated)(renderEmail(faciaPage)))
      case Some((faciaPage: PressedPage, targetedTerritories))
          if FaciaPicker.getTier(faciaPage, path)(request) == RemoteRender
            && !request.isJson =>
        val pageType = PageType(faciaPage, request, context)
        withVaryHeader(remoteRenderer.getFront(ws, faciaPage, pageType)(request), targetedTerritories)
      case Some((faciaPage: PressedPage, targetedTerritories)) =>
        val result = successful(
          Cached(CacheTime.Facia)(
            if (request.isRss) {
              val body = TrailsToRss.fromPressedPage(faciaPage)
              RevalidatableResult(Ok(body).as("text/xml; charset=utf-8"), body)
            } else if (request.isJson) {
              if (request.forceDCR) {
                JsonComponent.fromWritable(
                  DotcomFrontsRenderingDataModel(
                    page = faciaPage,
                    request = request,
                    pageType = PageType(faciaPage, request, context),
                  ),
                )
              } else JsonFront(faciaPage)
            } else if (request.isEmail || ConfigAgent.isEmailFront(path)) {
              renderEmail(faciaPage)
            } else if (TrailsToShowcase.isShowcaseFront(faciaPage)) {
              renderShowcaseFront(faciaPage)
            } else {
              RevalidatableResult.Ok(FrontHtmlPage.html(faciaPage))
            },
          ),
        )

        withVaryHeader(result, targetedTerritories)
      case None => {
        successful(Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound)))
      }
    }

    futureResult.failed.foreach { t: Throwable => log.error(s"Failed rendering $path with $t", t) }
    futureResult
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

  def renderFrontPress(path: String): Action[AnyContent] =
    Action.async { implicit request => renderFrontPressResult(path) }

  def renderContainer(id: String, preserveLayout: Boolean = false): Action[AnyContent] =
    Action.async { implicit request =>
      renderContainerView(id, preserveLayout)
    }

  def renderMostRelevantContainerJson(path: String): Action[AnyContent] =
    Action.async { implicit request =>
      val canonicalId = ConfigAgent
        .getCanonicalIdForFront(path)
        .orElse(
          alternativeEndpoints(path).map(ConfigAgent.getCanonicalIdForFront).headOption.flatten,
        )

      canonicalId
        .map { collectionId =>
          renderContainerView(collectionId)
        }
        .getOrElse(successful(NotFound))
    }

  def alternativeEndpoints(path: String): Seq[String] = path.split("/").toList.take(2).reverse

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
      frontJsonFapi.get(path, fullRequestType).flatMap {
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

  /**
    * Note, the way this method works is a bit circuitous. Firstly, it finds a
    * front that contains the collection (via the ConfigAgent, which is
    * basically a cache of configuration for Guardian Fronts). It then looks up
    * that front in Frontend's S3 and extracts the full collection from it (with
    * curated and backfill content etc.). It would be easier if collections were
    * stored somewhere independently of Fronts.
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
)(implicit val context: ApplicationContext)
    extends FaciaController
