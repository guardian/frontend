package renderers

import akka.actor.ActorSystem
import com.gu.contentapi.client.model.v1.Blocks
import common.Logging
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.switches.Switches.CircuitBreakerSwitch
import model.Cached.RevalidatableResult
import model.dotcomponents.{DataModelV3, DotcomponentsDataModel}
import model.{Cached, PageWithStoryPackage}
import play.api.libs.ws.WSClient
import play.api.mvc.{RequestHeader, Result}
import play.twirl.api.Html

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._
import model.dotcomponents.CommercialConfiguration

class RemoteRenderer extends Logging {

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
    article: PageWithStoryPackage,
    endpoint: String
  )(implicit request: RequestHeader): Future[Result] = {

    def get(): Future[Result] = {
      ws.url(endpoint)
        .withRequestTimeout(Configuration.rendering.timeout)
        .addHttpHeaders("Content-Type" -> "application/json")
        .post(payload)
        .map(response => {
          response.status match {
            case 200 =>
              Cached(article)(RevalidatableResult.OkDotcomponents(Html(response.body)))
            case 400 =>
              log.error("Remote renderer validation error: " + response.body)
              throw new Exception(response.body)
            case _ =>
              throw new Exception(response.body)
          }
        })
    }


    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(get())
    } else {
      get()
    }
  }

  def getAMPArticle(
    ws: WSClient,
    payload: String,
    page: PageWithStoryPackage,
    blocks: Blocks,
    commercialConfiguration: CommercialConfiguration
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomponentsDataModel.fromArticle(page, request, blocks, commercialConfiguration)
    val json = DataModelV3.toJson(dataModel)
    get(ws, json, page, Configuration.rendering.AMPArticleEndpoint)
  }

  def getArticle(
    ws:WSClient,
    path: String,
    page: PageWithStoryPackage,
    blocks: Blocks,
    commercialConfiguration: CommercialConfiguration
  )(implicit request: RequestHeader): Future[Result] = {
    val dataModel = DotcomponentsDataModel.fromArticle(page, request, blocks, commercialConfiguration)
    val json = DataModelV3.toJson(dataModel)
    get(ws, json, page, Configuration.rendering.renderingEndpoint)
  }
}

object RemoteRenderer {
  def apply(): RemoteRenderer = new RemoteRenderer()
}
