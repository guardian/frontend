package controllers.admin

import common.{ImplicitControllerExecutionContext, GuLogging}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import tools._
import model.{ApplicationContext, NoCache}
import conf.{Configuration, Static}

class MetricsController(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {
  // We only do PROD metrics

  lazy val stage = Configuration.environment.stage.toUpperCase

  def renderLoadBalancers(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        graphs <- CloudWatch.dualOkLatencyFullStack()
      } yield NoCache(Ok(views.html.lineCharts(graphs)))
    }

  def renderErrors(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        errors4xx <- HttpErrors.global4XX()
        errors5xx <- HttpErrors.global5XX()
      } yield NoCache(Ok(views.html.lineCharts(Seq(errors4xx, errors5xx))))
    }

  def render4XX(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        notFound <- HttpErrors.notFound()
      } yield NoCache(Ok(views.html.lineCharts(notFound)))
    }

  def render5XX(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        httpErrors <- HttpErrors.errors()
      } yield NoCache(Ok(views.html.lineCharts(httpErrors)))
    }

  def renderGooglebot404s(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        googleBot404s <- HttpErrors.googlebot404s()
      } yield NoCache(Ok(views.html.lineCharts(googleBot404s, Some("GoogleBot 404s"))))
    }

  def renderAfg(): Action[AnyContent] =
    Action.async { implicit request =>
      wsClient.url("https://s3-eu-west-1.amazonaws.com/aws-frontend-metrics/frequency/index.html").get() map {
        response =>
          NoCache(Ok(views.html.afg(response.body)))
      }
    }

  def renderBundleVisualization(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(SeeOther(Static("javascripts/webpack-stats.html")))
    }

  def renderBundleAnalyzer(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(SeeOther(Static("javascripts/bundle-analyzer-report.html")))
    }

  private def toPercentage(graph: AwsLineChart) =
    graph.dataset
      .map(_.values)
      .collect { case Seq(saw, clicked) => if (saw == 0) 0.0 else clicked / saw * 100 }

}
