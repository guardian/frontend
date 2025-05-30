package controllers.admin

import common.{GuLogging, ImplicitControllerExecutionContext}
import model.{ApplicationContext, NoCache}
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import tools._

import scala.concurrent.Future

class AnalyticsController(val controllerComponents: ControllerComponents)(implicit context: ApplicationContext)
    extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  // IN PROGRESS: Part of A/B test overhaul work, not currently accessible via the landing page, may be non-functional in PROD
  def newabtests(): Action[AnyContent] =
    Action.async { implicit request =>
      val frameUrl = Store.getAbTestFrameUrl
      Future(NoCache(Ok(views.html.abtestsNew(frameUrl))))
    }

  def abtests(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.abtests())))
    }
}
