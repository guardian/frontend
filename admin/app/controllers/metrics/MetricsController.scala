package controllers.admin

import common.{ExecutionContexts, Logging}
import controllers.AuthLogging
import play.api.libs.ws.WS
import play.api.mvc.Controller
import tools._
import model.NoCache
import conf.Configuration
import tools.CloudWatch._
import play.api.Play.current

import scala.concurrent.Future

object MetricsController extends Controller with Logging with AuthLogging with ExecutionContexts {
  // We only do PROD metrics

  val stage = Configuration.environment.stage.toUpperCase

  def renderLoadBalancers() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      latency <- CloudWatch.fullStackLatency
      fullStackOks <- CloudWatch.requestOkFullStack
    } yield NoCache(Ok(views.html.lineCharts("PROD", (latency ++ fullStackOks).groupBy(_.name).flatMap(_._2).toSeq)))
  }

  def renderErrors() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      errors4xx <- HttpErrors.global4XX
      errors5xx <- HttpErrors.global5XX
    } yield NoCache(Ok(views.html.lineCharts("PROD", Seq(errors4xx, errors5xx))))
  }

  def render4XX() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      notFound <- HttpErrors.notFound
    } yield NoCache(Ok(views.html.lineCharts("PROD", notFound)))
  }

  def render5XX() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      httpErrors <- HttpErrors.errors
    } yield NoCache(Ok(views.html.lineCharts("PROD", httpErrors)))
  }

  def renderGooglebot404s() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      googleBot404s <- HttpErrors.googlebot404s
    } yield NoCache(Ok(views.html.lineCharts("PROD", googleBot404s, Some("GoogleBot 404s"))))
  }

  def renderMemory() = AuthActions.AuthActionTest.async { implicit request =>
    for {
      metrics <- MemoryMetrics.memory
    } yield NoCache(Ok(views.html.lineCharts(stage, metrics)))
  }

  def renderAssets() = AuthActions.AuthActionTest.async { implicit request =>
    Future.successful(NoCache(Ok(views.html.staticAssets(stage, AssetMetricsCache.sizes))))
  }

  def renderAfg() = AuthActions.AuthActionTest.async { implicit request =>
    WS.url("https://s3-eu-west-1.amazonaws.com/aws-frontend-metrics/frequency/index.html").get() map { response =>
      NoCache(Ok(views.html.afg(stage, response.body)))
    }
  }

  private def toPercentage(graph: AwsLineChart) = graph.dataset.map(_.values)
    .collect { case Seq(saw, clicked) => if (saw == 0) 0.0 else clicked / saw * 100 }

}
