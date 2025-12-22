package controllers

import common.ImplicitControllerExecutionContext
import model.ApplicationContext
import model.IdentityPage
import play.api.mvc._
import utils.SafeLogging

class FormstackController(
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  val page = IdentityPage("/form", "Form")

  def formstackFormEmbed(formReference: String): Action[AnyContent] =
    formstackForm(formReference)

  def formstackForm(formReference: String): Action[AnyContent] =
    Action { implicit request =>
      logger.info(s"Request path is: ${request.path}")
      val result = NotFound(views.html.formstack.formstackFormNotFound(page))
      logger.info(s"Response for ${request.path} is: ${result.header.status}")
      result
    }

  def complete: Action[AnyContent] =
    Action { implicit request =>
      logger.info(s"Request path is: ${request.path}")
      val result = Ok(views.html.formstack.formstackComplete(page))
      logger.info(s"Response for ${request.path} is: ${result.header.status}")
      result
    }
}
