package controllers.admin

import common.Logging
import controllers.AuthLogging
import play.api.mvc.Controller
import tools._
import model.NoCache
import conf.Configuration
import tools.CloudWatch._

object MetricsController extends Controller with Logging with AuthLogging {
  // We only do PROD metrics

  val stage = Configuration.environment.stage.toUpperCase

  def renderLoadBalancers() = AuthActions.AuthActionTest { request =>
    val latency = CloudWatch.fullStackLatency
    val charts = (latency ++ CloudWatch.requestOkFullStack).groupBy(_.name).flatMap(_._2).toSeq
    NoCache(Ok(views.html.lineCharts("PROD", charts)))
  }

  def renderErrors() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.lineCharts("PROD", Seq(HttpErrors.global4XX, HttpErrors.global5XX))))
  }

  def render4XX() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.lineCharts("PROD", HttpErrors.notFound)))
  }

  def render5XX() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.lineCharts("PROD", HttpErrors.errors)))
  }

  def renderGooglebot404s() = AuthActions.AuthActionTest { request =>
    NoCache(Ok(views.html.lineCharts("PROD", HttpErrors.googlebot404s, Some("GoogleBot 404s"))))
  }

  def renderMemory() = AuthActions.AuthActionTest{ request =>
    val metrics = MemoryMetrics.memory
    NoCache(Ok(views.html.lineCharts(stage, metrics)))
  }

  def renderAssets() = AuthActions.AuthActionTest{ request =>

    val metrics = AssetMetrics.assets
    NoCache(Ok(views.html.staticAssets(stage, metrics)))
  }
}
