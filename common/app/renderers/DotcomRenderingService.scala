package renderers

import akka.actor.ActorSystem
import com.gu.contentapi.client.model.v1.Blocks
import common.{GuLogging, LinkTo}
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerSwitch
import model.Cached.RevalidatableResult
import model.dotcomrendering.{DotcomRenderingDataModel, DotcomRenderingUtils}
import model.{ArticlePage, Cached, InteractivePage, LiveBlogPage, NoCache, Page, PageWithStoryPackage}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import model.dotcomrendering.PageType
import http.ResultWithPreconnectPreload
import http.HttpPreconnections

import java.net.ConnectException

// Introduced as CAPI error handling elsewhere would smother a regular ConnectException.
case class DCRLocalConnectException(message: String) extends ConnectException(message)

class DotcomRenderingService extends GuLogging with ResultWithPreconnectPreload {

  private[this] val circuitBreaker = CircuitBreakerRegistry.withConfig(
    name = "dotcom-rendering-client",
    system = ActorSystem("dotcom-rendering-client-circuit-breaker"),
    maxFailures = Configuration.rendering.circuitBreakerMaxFailures,
    callTimeout = Configuration.rendering.timeout.plus(200.millis),
    resetTimeout = Configuration.rendering.timeout * 4,
  )

  private[this] def post(
      ws: WSClient,
      payload: String,
      endpoint: String,
      page: Page,
  )(implicit request: RequestHeader): Future[Result] = {

    def doPost() = {
      val resp = ws
        .url(endpoint)
        .withRequestTimeout(Configuration.rendering.timeout)
        .addHttpHeaders("Content-Type" -> "application/json")
        .post(payload)

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
          Future.failed(new DCRLocalConnectException(msg))
      })
    }

    def handler(response: WSResponse): Result = {
      response.status match {
        case 200 =>
          Cached(page)(RevalidatableResult.Ok(Html(response.body)))
            .withHeaders("X-GU-Dotcomponents" -> "true")
            .withPreconnect(HttpPreconnections.defaultUrls)
        case 400 =>
          // if DCR returns a 400 it's because *we* failed, so frontend should return a 500
          NoCache(play.api.mvc.Results.InternalServerError("Remote renderer validation error (400)"))
            .withHeaders("X-GU-Dotcomponents" -> "true")
        case _ =>
          log.error(s"Request to DCR failed: status ${response.status}, body: ${response.body}")
          NoCache(
            play.api.mvc.Results
              .InternalServerError("Remote renderer error (500)")
              .withHeaders("X-GU-Dotcomponents" -> "true"),
          )
      }
    }

    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(doPost()).map(handler)
    } else {
      doPost().map(handler)
    }
  }

  def getAMPArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = page match {
      case liveblog: LiveBlogPage => DotcomRenderingDataModel.forLiveblog(liveblog, blocks, request, pageType)
      case _                      => DotcomRenderingDataModel.forArticle(page, blocks, request, pageType)
    }
    val json = DotcomRenderingDataModel.toJson(dataModel)

    post(ws, json, Configuration.rendering.baseURL + "/AMPArticle", page)
  }

  def getArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forArticle(page, blocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/Article", page)
  }

  def getInteractive(
      ws: WSClient,
      page: InteractivePage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forInteractive(page, blocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/Interactive", page)
  }

  def getAMPInteractive(
      ws: WSClient,
      page: InteractivePage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {

    val dataModel = DotcomRenderingDataModel.forInteractive(page, blocks, request, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)
    post(ws, json, Configuration.rendering.baseURL + "/AMPInteractive", page)
  }

}

object DotcomRenderingService {
  def apply(): DotcomRenderingService = new DotcomRenderingService()
}
