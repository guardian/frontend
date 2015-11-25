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

object MetricsController extends Controller with Logging with AuthLogging with ExecutionContexts {
  // We only do PROD metrics

  val stage = Configuration.environment.stage.toUpperCase

  def renderLoadBalancers() = AuthActions.AuthActionTest.async { request =>
    for {
      latency <- CloudWatch.fullStackLatency
      fullStackOks <- CloudWatch.requestOkFullStack
    } yield NoCache(Ok(views.html.lineCharts("PROD", (latency ++ fullStackOks).groupBy(_.name).flatMap(_._2).toSeq)))
  }

  def renderErrors() = AuthActions.AuthActionTest.async { request =>
    for {
      errors4xx <- HttpErrors.global4XX
      errors5xx <- HttpErrors.global5XX
    } yield NoCache(Ok(views.html.lineCharts("PROD", Seq(errors4xx, errors5xx))))
  }

  def render4XX() = AuthActions.AuthActionTest.async { request =>
    for {
      notFound <- HttpErrors.notFound
    } yield NoCache(Ok(views.html.lineCharts("PROD", notFound)))
  }

  def render5XX() = AuthActions.AuthActionTest.async { request =>
    for {
      httpErrors <- HttpErrors.errors
    } yield NoCache(Ok(views.html.lineCharts("PROD", httpErrors)))
  }

  def renderGooglebot404s() = AuthActions.AuthActionTest.async { request =>
    for {
      googleBot404s <- HttpErrors.googlebot404s
    } yield NoCache(Ok(views.html.lineCharts("PROD", googleBot404s, Some("GoogleBot 404s"))))
  }

  def renderMemory() = AuthActions.AuthActionTest.async { request =>
    for {
      metrics <- MemoryMetrics.memory
    } yield NoCache(Ok(views.html.lineCharts(stage, metrics)))
  }

  def renderAssets() = AuthActions.AuthActionTest.async { request =>
    AssetMetrics.assets.map(metrics => NoCache(Ok(views.html.staticAssets(stage, metrics))))
  }

  def renderAfg() = AuthActions.AuthActionTest.async { request =>
    WS.url("https://s3-eu-west-1.amazonaws.com/aws-frontend-metrics/frequency/index.html").get() map { response =>
      NoCache(Ok(views.html.afg(stage, response.body)))
    }
  }

  private def toPercentage(graph: AwsLineChart) = graph.dataset.map(_.values)
    .collect { case Seq(saw, clicked) => if (saw == 0) 0.0 else clicked / saw * 100 }

  def renderHeadlinesTest() = AuthActions.AuthActionTest.async { request =>
    for {
      controlGraph <- CloudWatch.headlineTests.control
      variantGraph <- CloudWatch.headlineTests.variant
    } yield {

      val controlPercentages = toPercentage(controlGraph)
      val variantPercentages = toPercentage(variantGraph)

      val change = controlPercentages.zip(variantPercentages)
        .map{ case (control,variant) => variant - control}
        .map(percentage => ChartRow("%1.2f" format percentage, Seq(percentage)))
        .zip(controlGraph.dataset)
        .map{ case (p,c) => p.copy(rowKey = c.rowKey)}

      val percentageChangeChart = new tools.Chart {
        override def name: String = "Percentage change in click through rate"
        override def labels: Seq[String] = Seq("", "Test headline")
        override def dataset: Seq[ChartRow] = change
        override def format: ChartFormat = ChartFormat.SingleLineGreen
      }

      NoCache(Ok(views.html.lineCharts(stage, Seq(controlGraph, variantGraph, percentageChangeChart), title = Some("Headlines AB test"))))
    }
  }


}
