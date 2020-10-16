package renderers

import akka.actor.ActorSystem
import com.gu.contentapi.client.model.v1.Blocks
import common.{LinkTo, Logging}
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerSwitch
import model.Cached.RevalidatableResult
import model.dotcomrendering.{DotcomRenderingDataModel, DotcomRenderingTransforms}
import model.{Cached, NoCache, PageWithStoryPackage}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import model.dotcomrendering.PageType

class DotcomRenderingService extends Logging {

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

    def getRecover(): Future[Result] = {
      ws.url(endpoint)
        .withRequestTimeout(Configuration.rendering.timeout)
        .addHttpHeaders("Content-Type" -> "application/json")
        .post(payload)
        .map(handler)
    }

    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(getRecover())
    } else {
      getRecover()
    }
  }

  def getAMPArticle(
      ws: WSClient,
      page: PageWithStoryPackage,
      blocks: Blocks,
      pageType: PageType,
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomRenderingTransforms.fromArticle(page, request, blocks, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    def handler(response: WSResponse): Result = {
      response.status match {
        case 200 =>
          Cached(page)(RevalidatableResult.Ok(Html(response.body)))
            .withHeaders("x-gu-dotcomrendering" -> "true")
        case 400 =>
          // if DCR returns a 400 it's because *we* failed, so frontend should return a 500
          NoCache(play.api.mvc.Results.InternalServerError("Remote renderer validation error (400)"))
            .withHeaders("x-gu-dotcomrendering" -> "true")
        case _ =>
          // Ensure AMP doesn't cache error responses by redirecting them to non-AMP
          NoCache(
            play.api.mvc.Results
              .TemporaryRedirect(LinkTo(page.metadata.url))
              .withHeaders("x-gu-dotcomrendering" -> "true"),
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
    val dataModel = DotcomRenderingTransforms.fromArticle(page, request, blocks, pageType)
    val json = DotcomRenderingDataModel.toJson(dataModel)

    def handler(response: WSResponse): Result = {
      response.status match {
        case 200 =>
          Cached(page)(RevalidatableResult.Ok(Html(response.body)))
            .withHeaders("x-gu-dotcomrendering" -> "true")
        case 400 =>
          // if DCR returns a 400 it's because *we* failed, so frontend should return a 500
          NoCache(play.api.mvc.Results.InternalServerError("Remote renderer validation error (400)"))
            .withHeaders("x-gu-dotcomrendering" -> "true")
        case _ =>
          NoCache(
            play.api.mvc.Results
              .InternalServerError("Remote renderer error (500)")
              .withHeaders("x-gu-dotcomrendering" -> "true"),
          )
      }
    }

    get(ws, json, Configuration.rendering.renderingEndpoint, handler)
  }
}

object DotcomRenderingService {
  def apply(): DotcomRenderingService = new DotcomRenderingService()
}
