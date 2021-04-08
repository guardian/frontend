package renderers

import akka.actor.ActorSystem
import com.gu.contentapi.client.model.v1.Blocks
import common.{GuLogging, LinkTo}
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerSwitch
import model.Cached.RevalidatableResult
import model.dotcomrendering.{DotcomRenderingDataModel, DotcomRenderingUtils}
import model.{Cached, NoCache, PageWithStoryPackage}
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

class DotcomRenderingService extends GuLogging with ResultWithPreconnectPreload {

  private[this] val circuitBreaker = CircuitBreakerRegistry.withConfig(
    name = "dotcom-rendering-client",
    system = ActorSystem("dotcom-rendering-client-circuit-breaker"),
    maxFailures = Configuration.rendering.circuitBreakerMaxFailures,
    callTimeout = Configuration.rendering.timeout.plus(200.millis),
    resetTimeout = Configuration.rendering.timeout * 4,
  )

  private[this] def get(
      ws: WSClient,
      payload: String,
      endpoint: String,
      handler: WSResponse => Result,
  )(implicit request: RequestHeader): Future[Result] = {

    def doGet() = {
      val resp = ws
        .url(endpoint)
        .withRequestTimeout(Configuration.rendering.timeout)
        .addHttpHeaders("Content-Type" -> "application/json")
        .post(payload)

      resp.recoverWith({
        case _: ConnectException if Configuration.environment.stage == "DEV" =>
          val msg = s"""Connection refused to ${endpoint}.
              |
              |You are trying to access a DCR page via Frontend. Most of the time you are better off developing directly
              |on DCR. See https://github.com/guardian/dotcom-rendering for how to get started with this.
              |
              |If you do need to access DCR via Frontend, then make sure to run DCR locally. E.g (from DCR directory):
              |
              |    $$ make build
              |    $$ PORT 3030 node dist/frontend.server.js""".stripMargin
          Future.failed(new ConnectException(msg))
      })
    }

    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(doGet()).map(handler)
    } else {
      doGet().map(handler)
    }
  }

  def getAMPArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingUtils.fromArticle(page, request, blocks, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    def handler(response: WSResponse): Result = {
      response.status match {
        case 200 =>
          Cached(page)(RevalidatableResult.Ok(Html(response.body)))
            .withHeaders("X-GU-Dotcomponents" -> "true")
        case 400 =>
          // if DCR returns a 400 it's because *we* failed, so frontend should return a 500
          NoCache(play.api.mvc.Results.InternalServerError("Remote renderer validation error (400)"))
            .withHeaders("X-GU-Dotcomponents" -> "true")
        case _ =>
          // Ensure AMP doesn't cache error responses by redirecting them to non-AMP
          NoCache(
            play.api.mvc.Results
              .TemporaryRedirect(LinkTo(page.metadata.url))
              .withHeaders("X-GU-Dotcomponents" -> "true"),
          )
      }
    }

    get(ws, json, Configuration.rendering.AMPArticleEndpoint, handler)
  }

  def getArticle(
      ws: WSClient,
      path: String,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingUtils.fromArticle(page, request, blocks, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

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
          NoCache(
            play.api.mvc.Results
              .InternalServerError("Remote renderer error (500)")
              .withHeaders("X-GU-Dotcomponents" -> "true"),
          )
      }
    }

    get(ws, json, Configuration.rendering.renderingEndpoint, handler)
  }
}

object DotcomRenderingService {
  def apply(): DotcomRenderingService = new DotcomRenderingService()
}
