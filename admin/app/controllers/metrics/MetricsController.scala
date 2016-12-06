package controllers.admin

import common.{ExecutionContexts, Logging}
import play.api.libs.ws.WSClient
import play.api.mvc.Controller
import play.api.mvc.Action
import tools._
import model.NoCache
import conf.Configuration
import play.api.Environment

import scala.concurrent.Future

class MetricsController(wsClient: WSClient)(implicit env: Environment) extends Controller with Logging with ExecutionContexts {
  // We only do PROD metrics

  val stage = Configuration.environment.stage.toUpperCase

  def renderLoadBalancers() = Action.async { implicit request =>
    for {
      graphs <- CloudWatch.dualOkLatencyFullStack
    } yield NoCache(Ok(views.html.lineCharts(graphs)))
  }

  def renderErrors() = Action.async { implicit request =>
    for {
      errors4xx <- HttpErrors.global4XX
      errors5xx <- HttpErrors.global5XX
    } yield NoCache(Ok(views.html.lineCharts(Seq(errors4xx, errors5xx))))
  }

  def render4XX() = Action.async { implicit request =>
    for {
      notFound <- HttpErrors.notFound
    } yield NoCache(Ok(views.html.lineCharts(notFound)))
  }

  def render5XX() = Action.async { implicit request =>
    for {
      httpErrors <- HttpErrors.errors
    } yield NoCache(Ok(views.html.lineCharts(httpErrors)))
  }

  def renderGooglebot404s() = Action.async { implicit request =>
    for {
      googleBot404s <- HttpErrors.googlebot404s
    } yield NoCache(Ok(views.html.lineCharts(googleBot404s, Some("GoogleBot 404s"))))
  }

  def renderMemory() = Action.async { implicit request =>
    for {
      metrics <- MemoryMetrics.memory
    } yield NoCache(Ok(views.html.lineCharts(metrics)))
  }

  def renderAssets() = Action.async { implicit request =>
    Future.successful(NoCache(Ok(views.html.staticAssets(AssetMetricsCache.sizes))))
  }

  def renderAfg() = Action.async { implicit request =>
    wsClient.url("https://s3-eu-west-1.amazonaws.com/aws-frontend-metrics/frequency/index.html").get() map { response =>
      NoCache(Ok(views.html.afg(response.body)))
    }
  }

  private def toPercentage(graph: AwsLineChart) = graph.dataset.map(_.values)
    .collect { case Seq(saw, clicked) => if (saw == 0) 0.0 else clicked / saw * 100 }

}
