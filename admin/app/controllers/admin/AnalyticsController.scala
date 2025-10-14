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

  def abTests(): Action[AnyContent] =
    Action.async { implicit request =>
      val frameUrl = Store.getAbTestFrameUrl
      Future(NoCache(Ok(views.html.abTests(frameUrl))))
    }

  def legacyAbTests(): Action[AnyContent] =
    Action.async { implicit request =>
      Future(NoCache(Ok(views.html.legacyAbTests())))
    }
}
