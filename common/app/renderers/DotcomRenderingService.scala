package renderers

import akka.actor.ActorSystem
import com.gu.contentapi.client.model.v1.{Block, Blocks}
import common.{DCRMetrics, GuLogging}
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerSwitch
import http.{HttpPreconnections, ResultWithPreconnectPreload}
import model.Cached.{RevalidatableResult, WithoutRevalidationResult}
import model.dotcomrendering.{
  DotcomBlocksRenderingDataModel,
  DotcomFrontsRenderingDataModel,
  DotcomRenderingDataModel,
  OnwardCollectionResponse,
  PageType,
}
import services.NewsletterData
import model.{
  CacheTime,
  Cached,
  InteractivePage,
  LiveBlogPage,
  NoCache,
  PageWithStoryPackage,
  PressedPage,
  Topic,
  TopicResult,
}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.Results.{InternalServerError, NotFound}
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import java.lang.System.currentTimeMillis
import java.net.ConnectException
import java.util.concurrent.TimeoutException
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import model.dotcomrendering.Trail

// Introduced as CAPI error handling elsewhere would smother these otherwise
case class DCRLocalConnectException(message: String) extends ConnectException(message)
case class DCRTimeoutException(message: String) extends TimeoutException(message)
case class DCRRenderingException(message: String) extends IllegalStateException(message)

class DotcomRenderingService extends GuLogging with ResultWithPreconnectPreload {

  private[this] val circuitBreaker = CircuitBreakerRegistry.withConfig(
    name = "dotcom-rendering-client",
    system = ActorSystem("dotcom-rendering-client-circuit-breaker"),
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

    val start = currentTimeMillis

    val resp = ws
      .url(endpoint)
      .withRequestTimeout(timeout)
      .addHttpHeaders("Content-Type" -> "application/json")
      .post(payload)

    resp.foreach(_ => {
      DCRMetrics.DCRLatencyMetric.recordDuration(currentTimeMillis - start)
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
          Cached(cacheTime)(RevalidatableResult.Ok(Html(response.body)))
            .withHeaders("X-GU-Dotcomponents" -> "true")
            .withPreconnect(HttpPreconnections.defaultUrls)
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
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = page match {
      case liveblog: LiveBlogPage =>
        DotcomRenderingDataModel.forLiveblog(
          liveblog,
          blocks,
          request,
          pageType,
          filterKeyEvents,
          forceLive = false,
          newsletter = newsletter,
          topicResult = None,
        )
      case _ => DotcomRenderingDataModel.forArticle(page, blocks, request, pageType, newsletter, None)
    }
    val json = DotcomRenderingDataModel.toJson(dataModel)

    post(ws, json, Configuration.rendering.baseURL + "/AMPArticle", page.metadata.cacheTime)
  }

  def getArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
      filterKeyEvents: Boolean,
      forceLive: Boolean = false,
      availableTopics: Option[Seq[Topic]] = None,
      newsletter: Option[NewsletterData],
      topicResult: Option[TopicResult],
      onwards: Option[Seq[OnwardCollectionResponse]],
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
        )
      case _ => DotcomRenderingDataModel.forArticle(page, blocks, request, pageType, newsletter, onwards)
    }

    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/Article", page.metadata.cacheTime)
  }

  def getBlocks(
      ws: WSClient,
      page: LiveBlogPage,
      blocks: Seq[Block],
  )(implicit request: RequestHeader): Future[String] = {
    val dataModel = DotcomBlocksRenderingDataModel(page, request, blocks)
    val json = DotcomBlocksRenderingDataModel.toJson(dataModel)

    postWithoutHandler(ws, json, Configuration.rendering.baseURL + "/Blocks")
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
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomFrontsRenderingDataModel(page, request, pageType)

    val json = DotcomFrontsRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/Front", CacheTime.Facia)
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
}

object DotcomRenderingService {
  def apply(): DotcomRenderingService = new DotcomRenderingService()
}
