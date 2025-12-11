package renderers

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import com.gu.contentapi.client.model.v1.{Block, Blocks, Content, Crossword}
import common.{DCRMetrics, GuLogging}
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerDcrSwitch
import crosswords.CrosswordPageWithContent
import http.{HttpPreconnections, ResultWithPreconnectPreload}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.dotcomrendering._
import model.dotcomrendering.pageElements.EditionsCrosswordRenderingDataModel
import model.meta.BlocksOn
import model.{
  CacheTime,
  Cached,
  GalleryPage,
  ImageContentPage,
  InteractivePage,
  LiveBlogPage,
  MediaPage,
  NoCache,
  PageWithStoryPackage,
  PressedPage,
  RelatedContentItem,
  SimplePage,
}
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Results.{InternalServerError, NotFound}
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html
import services.newsletters.model.{NewsletterLayout, NewsletterResponseV2}
import services.{IndexPage, NewsletterData}

import java.lang.System.currentTimeMillis
import java.net.ConnectException
import java.util.concurrent.TimeoutException
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._

// Introduced as CAPI error handling elsewhere would smother these otherwise
case class DCRLocalConnectException(message: String) extends ConnectException(message)
case class DCRTimeoutException(message: String) extends TimeoutException(message)
case class DCRRenderingException(message: String) extends IllegalStateException(message)

class DotcomRenderingService extends GuLogging with ResultWithPreconnectPreload {

  private[this] val circuitBreaker = CircuitBreakerRegistry.withConfig(
    name = "dotcom-rendering-client",
    system = PekkoActorSystem("dotcom-rendering-client-circuit-breaker"),
    maxFailures = Configuration.rendering.circuitBreakerMaxFailures,
    callTimeout = Configuration.rendering.timeout.plus(200.millis),
    resetTimeout = Configuration.rendering.timeout * 4,
  )

  private[this] val circuitBreakerLongTimeout = CircuitBreakerRegistry.withConfig(
    name = "dotcom-rendering-client-long-timeout",
    system = PekkoActorSystem("dotcom-rendering-client-circuit-breaker-long-timeout"),
    maxFailures = Configuration.rendering.circuitBreakerMaxFailures,
    callTimeout = (Configuration.rendering.timeout * 2).plus(200.millis),
    resetTimeout = Configuration.rendering.timeout * 4,
  )

  private[this] def postWithoutHandler(
      ws: WSClient,
      payload: JsValue,
      endpoint: String,
      requestId: Option[String],
      timeout: Duration = Configuration.rendering.timeout,
  )(implicit request: RequestHeader): Future[WSResponse] = {

    val start = currentTimeMillis()

    val request = ws
      .url(endpoint)
      .withRequestTimeout(timeout)
      .addHttpHeaders("Content-Type" -> "application/json")

    val resp = requestId match {
      case Some(id) => request.addHttpHeaders("x-gu-xid" -> id).post(payload)
      case None     => request.post(payload)
    }

    resp.foreach(_ => {
      DCRMetrics.DCRLatencyMetric.recordDuration(currentTimeMillis() - start)
      DCRMetrics.DCRRequestCountMetric.increment()
    })

    resp.recoverWith({
      case _: ConnectException if Configuration.environment.stage == "DEV" =>
        val msg = s"""Connection refused to ${endpoint}.
                     |
                     |You are trying to access a Dotcom Rendering page via Frontend but it
                     |doesn't look like DCR is running locally on the expected port (3030).
                     |
                     |Note, for most use cases, we recommend developing directly on DCR.
                     |
                     |To get started with dotcom-rendering, see:
                     |
                     |    https://github.com/guardian/dotcom-rendering""".stripMargin
        Future.failed(DCRLocalConnectException(msg))
      case t: TimeoutException => Future.failed(DCRTimeoutException(t.getMessage))
    })
  }

  private[this] def post(
      ws: WSClient,
      payload: JsValue,
      endpoint: String,
      cacheTime: CacheTime,
      timeout: Duration = Configuration.rendering.timeout,
  )(implicit request: RequestHeader): Future[Result] = {
    val requestId = request.headers.get("x-gu-xid")
    def handler(response: WSResponse): Result = {
      response.status match {
        case 200 =>
          val cachedRequest = Cached(cacheTime)(RevalidatableResult.Ok(Html(response.body)))
            .withHeaders("X-GU-Dotcomponents" -> "true")

          response.header("Link") match {
            case Some(linkValue) =>
              cachedRequest
                // Send both the prefetch header for offline reading, and the usual preconnect URLs
                .withHeaders("Link" -> linkValue)
                .withPreconnect(HttpPreconnections.defaultUrls)
            // For any other requests, we return just the default link header with preconnect urls
            case _ => cachedRequest.withPreconnect(HttpPreconnections.defaultUrls)

          }
        case 400 =>
          // if DCR returns a 400 it's because *we* failed, so frontend should return a 500
          NoCache(InternalServerError("Remote renderer validation error (400)"))
            .withHeaders("X-GU-Dotcomponents" -> "true")
        case 415 =>
          // if DCR returns a 415 it's because we can't render a specific component, so page is not available
          Cached(CacheTime.NotFound)(WithoutRevalidationResult(NotFound))
            .withHeaders("X-GU-Dotcomponents" -> "true")
        case _ =>
          log.error(s"Request to DCR failed: status ${response.status}, path: ${request.path}, body: ${response.body}")
          NoCache(
            InternalServerError("Remote renderer error (500)")
              .withHeaders("X-GU-Dotcomponents" -> "true"),
          )
      }
    }

    if (CircuitBreakerDcrSwitch.isSwitchedOn) {
      val breaker = if (timeout > Configuration.rendering.timeout) circuitBreakerLongTimeout else circuitBreaker
      breaker
        .withCircuitBreaker(postWithoutHandler(ws, payload, endpoint, requestId, timeout))
        .map(handler)
    } else {
      postWithoutHandler(ws, payload, endpoint, requestId, timeout).map(handler)
    }
  }

  def getAMPArticle(
      ws: WSClient,
      pageBlocks: BlocksOn[PageWithStoryPackage],
      pageType: PageType,
      newsletter: Option[NewsletterData],
      filterKeyEvents: Boolean = false,
  )(implicit request: RequestHeader): Future[Result] =
    baseArticleRequest("/AMPArticle", ws, pageBlocks, pageType, filterKeyEvents, false, newsletter)

  def getDCARAssets(ws: WSClient, path: String)(implicit request: RequestHeader): Future[Result] = {
    ws
      .url(Configuration.rendering.articleBaseURL + path)
      .withRequestTimeout(Configuration.rendering.timeout)
      .get()
      .map { response =>
        response.status match {
          case 200 =>
            Cached(CacheTime.Default)(RevalidatableResult.Ok(Html(response.body)))
          case _ =>
            log.error(
              s"Request to DCR assets failed: status ${response.status}, path: ${request.path}",
            )
            NoCache(InternalServerError("Remote renderer error (500)"))
        }
      }
  }

  def getAppsArticle(
      ws: WSClient,
      pageBlocks: BlocksOn[PageWithStoryPackage],
      pageType: PageType,
      newsletter: Option[NewsletterData],
      filterKeyEvents: Boolean = false,
      forceLive: Boolean = false,
  )(implicit request: RequestHeader): Future[Result] =
    baseArticleRequest(
      "/AppsArticle",
      ws,
      pageBlocks,
      pageType,
      filterKeyEvents,
      forceLive,
      newsletter,
    )

  def getArticle(
      ws: WSClient,
      pageBlocks: BlocksOn[PageWithStoryPackage],
      pageType: PageType,
      newsletter: Option[NewsletterData],
      filterKeyEvents: Boolean = false,
      forceLive: Boolean = false,
  )(implicit request: RequestHeader): Future[Result] =
    baseArticleRequest(
      "/Article",
      ws,
      pageBlocks,
      pageType,
      filterKeyEvents,
      forceLive,
      newsletter,
    )

  private def baseArticleRequest(
      path: String,
      ws: WSClient,
      pageBlocks: BlocksOn[PageWithStoryPackage],
      pageType: PageType,
      filterKeyEvents: Boolean,
      forceLive: Boolean = false,
      newsletter: Option[NewsletterData],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = pageBlocks.page match {
      case liveblog: LiveBlogPage =>
        DotcomRenderingDataModel.forLiveblog(
          pageBlocks.copy(page = liveblog),
          request,
          pageType,
          filterKeyEvents,
          forceLive,
          newsletter,
        )
      case _ => DotcomRenderingDataModel.forArticle(pageBlocks, request, pageType, newsletter)
    }

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + path, pageBlocks.page.metadata.cacheTime)
  }

  def getBlocks(
      ws: WSClient,
      page: LiveBlogPage,
      blocks: Seq[Block],
  )(implicit request: RequestHeader): Future[String] = {
    val dataModel = DotcomBlocksRenderingDataModel(page, request, blocks)
    val json = DotcomBlocksRenderingDataModel.toJson(dataModel)
    val requestId = request.headers.get("x-gu-xid")

    postWithoutHandler(ws, json, Configuration.rendering.articleBaseURL + "/Blocks", requestId)
      .flatMap(response => {
        if (response.status == 200)
          Future.successful(response.body)
        else
          Future.failed(
            DCRRenderingException(
              s"getBlocks request to DCR failed: status ${response.status}, path: ${request.path}, body: ${response.body}",
            ),
          )
      })
  }

  def getAppsBlocks(
      ws: WSClient,
      page: LiveBlogPage,
      blocks: Seq[Block],
  )(implicit request: RequestHeader): Future[String] = {
    val dataModel = DotcomBlocksRenderingDataModel(page, request, blocks)
    val json = DotcomBlocksRenderingDataModel.toJson(dataModel)
    val requestId = request.headers.get("x-gu-xid")

    postWithoutHandler(ws, json, Configuration.rendering.articleBaseURL + "/AppsBlocks", requestId)
      .flatMap(response => {
        if (response.status == 200)
          Future.successful(response.body)
        else
          Future.failed(
            DCRRenderingException(
              s"getBlocks request to DCR failed: status ${response.status}, path: ${request.path}, body: ${response.body}",
            ),
          )
      })
  }

  def getFront(
      ws: WSClient,
      page: PressedPage,
      pageType: PageType,
      mostViewed: Seq[RelatedContentItem],
      deeplyRead: Option[Seq[Trail]],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomFrontsRenderingDataModel(
      page,
      request,
      pageType,
      mostViewed,
      deeplyRead,
    )

    val json = DotcomFrontsRenderingDataModel.toJson(dataModel)
    val timeout = if (Configuration.environment.stage == "DEV")
      Configuration.rendering.timeout * 5
    else
      Configuration.rendering.timeout * 2
    post(ws, json, Configuration.rendering.faciaBaseURL + "/Front", CacheTime.Facia, timeout)
  }

  def getTagPage(
      ws: WSClient,
      page: IndexPage,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomTagPagesRenderingDataModel(
      page,
      request,
      pageType,
    )

    val json = DotcomTagPagesRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.tagPageBaseURL + "/TagPage", CacheTime.Facia)
  }

  def getInteractive(
      ws: WSClient,
      pageBlocks: BlocksOn[InteractivePage],
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forInteractive(pageBlocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    // Nb. interactives have a longer timeout because some of them are very
    // large, unfortunately. E.g.
    // https://www.theguardian.com/education/ng-interactive/2018/may/29/university-guide-2019-league-table-for-computer-science-information.
    post(
      ws,
      json,
      Configuration.rendering.interactiveBaseURL + "/Interactive",
      pageBlocks.page.metadata.cacheTime,
      4.seconds,
    )
  }

  def getAMPInteractive(
      ws: WSClient,
      pageBlocks: BlocksOn[InteractivePage],
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forInteractive(pageBlocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.interactiveBaseURL + "/AMPInteractive", pageBlocks.page.metadata.cacheTime)
  }

  def getAppsInteractive(
      ws: WSClient,
      pageBlocks: BlocksOn[InteractivePage],
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forInteractive(pageBlocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    // Nb. interactives have a longer timeout because some of them are very
    // large unfortunately. E.g.
    // https://www.theguardian.com/education/ng-interactive/2018/may/29/university-guide-2019-league-table-for-computer-science-information.
    post(
      ws,
      json,
      Configuration.rendering.interactiveBaseURL + "/AppsInteractive",
      pageBlocks.page.metadata.cacheTime,
      4.seconds,
    )
  }

  def getEmailNewsletters(
      ws: WSClient,
      newsletters: List[NewsletterResponseV2],
      layout: Option[NewsletterLayout],
      page: SimplePage,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomNewslettersPageRenderingDataModel.apply(page, newsletters, layout, request)
    val json = DotcomNewslettersPageRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.faciaBaseURL + "/EmailNewsletters", CacheTime.Facia)
  }

  def getImageContent(
      ws: WSClient,
      imageContent: ImageContentPage,
      pageType: PageType,
      mainBlock: Option[Block],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forImageContent(imageContent, request, pageType, mainBlock)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", imageContent.metadata.cacheTime)
  }

  def getAppsImageContent(
      ws: WSClient,
      imageContent: ImageContentPage,
      pageType: PageType,
      mainBlock: Option[Block],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forImageContent(imageContent, request, pageType, mainBlock)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/AppsArticle", imageContent.metadata.cacheTime)
  }

  def getMedia(
      ws: WSClient,
      mediaPage: MediaPage,
      pageType: PageType,
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forMedia(mediaPage, request, pageType, blocks)

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", mediaPage.metadata.cacheTime)
  }

  def getAppsMedia(
      ws: WSClient,
      mediaPage: MediaPage,
      pageType: PageType,
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forMedia(mediaPage, request, pageType, blocks)

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/AppsArticle", mediaPage.metadata.cacheTime)
  }

  def getGallery(
      ws: WSClient,
      gallery: GalleryPage,
      pageType: PageType,
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forGallery(gallery, request, pageType, blocks)

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", gallery.metadata.cacheTime)
  }

  def getAppsGallery(
      ws: WSClient,
      gallery: GalleryPage,
      pageType: PageType,
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forGallery(gallery, request, pageType, blocks)

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/AppsArticle", gallery.metadata.cacheTime)
  }

  def getCrossword(
      ws: WSClient,
      crosswordPage: CrosswordPageWithContent,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forCrossword(crosswordPage, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", CacheTime.Crosswords)
  }

  def getEditionsCrossword(
      ws: WSClient,
      crosswords: EditionsCrosswordRenderingDataModel,
  )(implicit request: RequestHeader): Future[Result] = {
    val json = EditionsCrosswordRenderingDataModel.toJson(crosswords)
    post(ws, json, Configuration.rendering.articleBaseURL + "/EditionsCrossword", CacheTime.Default)
  }

  def getFootballPage(
      ws: WSClient,
      json: JsValue,
  )(implicit request: RequestHeader): Future[Result] = {
    post(ws, json, Configuration.rendering.articleBaseURL + "/FootballMatchListPage", CacheTime.Football)
  }

  def getFootballMatchSummaryPage(
      ws: WSClient,
      json: JsValue,
  )(implicit request: RequestHeader): Future[Result] = {
    post(ws, json, Configuration.rendering.articleBaseURL + "/FootballMatchSummaryPage", CacheTime.FootballMatch)
  }

  def getCricketPage(
      ws: WSClient,
      json: JsValue,
  )(implicit request: RequestHeader): Future[Result] = {
    post(ws, json, Configuration.rendering.articleBaseURL + "/CricketMatchPage", CacheTime.Cricket)
  }

  def getFootballTablesPage(
      ws: WSClient,
      json: JsValue,
  )(implicit request: RequestHeader): Future[Result] = {
    post(ws, json, Configuration.rendering.articleBaseURL + "/FootballTablesPage", CacheTime.FootballTables)
  }
}

object DotcomRenderingService {
  def apply(): DotcomRenderingService = new DotcomRenderingService()
}
