package renderers

import org.apache.pekko.actor.{ActorSystem => PekkoActorSystem}
import com.gu.contentapi.client.model.v1.{Block, Blocks, Content}
import common.{DCRMetrics, GuLogging}
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerSwitch
import http.{HttpPreconnections, ResultWithPreconnectPreload}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.dotcomrendering._
import model.{
  CacheTime,
  Cached,
  GalleryPage,
  ImageContentPage,
  InteractivePage,
  LiveBlogPage,
  MediaPage,
  MessageUsData,
  NoCache,
  PageWithStoryPackage,
  PressedPage,
  RelatedContentItem,
  SimplePage,
  Topic,
  TopicResult,
}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Results.{InternalServerError, NotFound}
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html
import services.newsletters.model.NewsletterResponseV2
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

  private[this] def postWithoutHandler(
      ws: WSClient,
      payload: String,
      endpoint: String,
      timeout: Duration = Configuration.rendering.timeout,
  )(implicit request: RequestHeader): Future[WSResponse] = {

    val start = currentTimeMillis()

    val resp = ws
      .url(endpoint)
      .withRequestTimeout(timeout)
      .addHttpHeaders("Content-Type" -> "application/json")
      .post(payload)

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
      payload: String,
      endpoint: String,
      cacheTime: CacheTime,
      timeout: Duration = Configuration.rendering.timeout,
  )(implicit request: RequestHeader): Future[Result] = {
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
          log.error(s"Request to DCR failed: status ${response.status}, body: ${response.body}")
          NoCache(
            InternalServerError("Remote renderer error (500)")
              .withHeaders("X-GU-Dotcomponents" -> "true"),
          )
      }
    }

    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(postWithoutHandler(ws, payload, endpoint, timeout)).map(handler)
    } else {
      postWithoutHandler(ws, payload, endpoint, timeout).map(handler)
    }
  }

  def getAMPArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      newsletter: Option[NewsletterData],
      filterKeyEvents: Boolean = false,
  )(implicit request: RequestHeader): Future[Result] =
    baseArticleRequest("/AMPArticle", ws, page, blocks, pageType, filterKeyEvents, false, None, newsletter, None, None)

  def getAppsArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      newsletter: Option[NewsletterData],
      filterKeyEvents: Boolean = false,
      forceLive: Boolean = false,
      availableTopics: Option[Seq[Topic]] = None,
      topicResult: Option[TopicResult] = None,
      messageUs: Option[MessageUsData] = None,
  )(implicit request: RequestHeader): Future[Result] =
    baseArticleRequest(
      "/AppsArticle",
      ws,
      page,
      blocks,
      pageType,
      filterKeyEvents,
      forceLive,
      availableTopics,
      newsletter,
      topicResult,
      messageUs,
    )

  def getArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      newsletter: Option[NewsletterData],
      filterKeyEvents: Boolean = false,
      forceLive: Boolean = false,
      availableTopics: Option[Seq[Topic]] = None,
      topicResult: Option[TopicResult] = None,
      messageUs: Option[MessageUsData] = None,
  )(implicit request: RequestHeader): Future[Result] =
    baseArticleRequest(
      "/Article",
      ws,
      page,
      blocks,
      pageType,
      filterKeyEvents,
      forceLive,
      availableTopics,
      newsletter,
      topicResult,
      messageUs,
    )

  private def baseArticleRequest(
      path: String,
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      filterKeyEvents: Boolean,
      forceLive: Boolean = false,
      availableTopics: Option[Seq[Topic]] = None,
      newsletter: Option[NewsletterData],
      topicResult: Option[TopicResult],
      messageUs: Option[MessageUsData],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = page match {
      case liveblog: LiveBlogPage =>
        DotcomRenderingDataModel.forLiveblog(
          liveblog,
          blocks,
          request,
          pageType,
          filterKeyEvents,
          forceLive,
          availableTopics,
          newsletter,
          topicResult,
          messageUs,
        )
      case _ => DotcomRenderingDataModel.forArticle(page, blocks, request, pageType, newsletter)
    }

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + path, page.metadata.cacheTime)
  }

  def getBlocks(
      ws: WSClient,
      page: LiveBlogPage,
      blocks: Seq[Block],
  )(implicit request: RequestHeader): Future[String] = {
    val dataModel = DotcomBlocksRenderingDataModel(page, request, blocks)
    val json = DotcomBlocksRenderingDataModel.toJson(dataModel)

    postWithoutHandler(ws, json, Configuration.rendering.articleBaseURL + "/Blocks")
      .flatMap(response => {
        if (response.status == 200)
          Future.successful(response.body)
        else
          Future.failed(
            DCRRenderingException(s"Request to DCR failed: status ${response.status}, body: ${response.body}"),
          )
      })
  }

  def getFront(
      ws: WSClient,
      page: PressedPage,
      pageType: PageType,
      mostViewed: Seq[RelatedContentItem],
      mostCommented: Option[Content],
      mostShared: Option[Content],
      deeplyRead: Option[Seq[Trail]],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomFrontsRenderingDataModel(
      page,
      request,
      pageType,
      mostViewed,
      mostCommented,
      mostShared,
      deeplyRead,
    )

    val json = DotcomFrontsRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/Front", CacheTime.Facia)
  }

  def getTagFront(
      ws: WSClient,
      page: IndexPage,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomTagFrontsRenderingDataModel(
      page,
      request,
      pageType,
    )

    val json = DotcomTagFrontsRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/TagFront", CacheTime.Facia)
  }

  def getInteractive(
      ws: WSClient,
      page: InteractivePage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forInteractive(page, blocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    // Nb. interactives have a longer timeout because some of them are very
    // large unfortunately. E.g.
    // https://www.theguardian.com/education/ng-interactive/2018/may/29/university-guide-2019-league-table-for-computer-science-information.
    post(ws, json, Configuration.rendering.baseURL + "/Interactive", page.metadata.cacheTime, 4.seconds)
  }

  def getAMPInteractive(
      ws: WSClient,
      page: InteractivePage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forInteractive(page, blocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/AMPInteractive", page.metadata.cacheTime)
  }

  def getAppsInteractive(
      ws: WSClient,
      page: InteractivePage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forInteractive(page, blocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    // Nb. interactives have a longer timeout because some of them are very
    // large unfortunately. E.g.
    // https://www.theguardian.com/education/ng-interactive/2018/may/29/university-guide-2019-league-table-for-computer-science-information.
    post(ws, json, Configuration.rendering.baseURL + "/AppsInteractive", page.metadata.cacheTime, 4.seconds)
  }

  def getEmailNewsletters(
      ws: WSClient,
      newsletters: List[NewsletterResponseV2],
      page: SimplePage,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomNewslettersPageRenderingDataModel.apply(page, newsletters, request)
    val json = DotcomNewslettersPageRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/EmailNewsletters", CacheTime.Facia)
  }

  def getImageContent(
      ws: WSClient,
      imageContent: ImageContentPage,
      pageType: PageType,
      mainBlock: Option[Block],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forImageContent(imageContent, request, pageType, mainBlock)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", CacheTime.Facia)
  }

  def getAppsImageContent(
      ws: WSClient,
      imageContent: ImageContentPage,
      pageType: PageType,
      mainBlock: Option[Block],
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forImageContent(imageContent, request, pageType, mainBlock)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/AppsArticle", CacheTime.Facia)
  }

  def getMedia(
      ws: WSClient,
      mediaPage: MediaPage,
      pageType: PageType,
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forMedia(mediaPage, request, pageType, blocks)

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", CacheTime.Facia)
  }

  def getGallery(
      ws: WSClient,
      gallery: GalleryPage,
      pageType: PageType,
      blocks: Blocks,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingDataModel.forGallery(gallery, request, pageType, blocks)

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.articleBaseURL + "/Article", CacheTime.Facia)
  }
}

object DotcomRenderingService {
  def apply(): DotcomRenderingService = new DotcomRenderingService()
}
