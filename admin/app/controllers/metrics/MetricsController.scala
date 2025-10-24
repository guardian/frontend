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

  def renderErrors(): Action[AnyContent] =
    Action.async { implicit request =>
      for {
        errors4xx <- HttpErrors.legacyElb4XXs()
        errors5xx <- HttpErrors.legacyElb5XXs()
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
}
