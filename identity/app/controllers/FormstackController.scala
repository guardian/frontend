package controllers

import actions.AuthenticatedActions
import play.api.mvc._
import model.{ApplicationContext, IdentityPage}
import common.ImplicitControllerExecutionContext
import services.{IdRequestParser, IdentityUrlBuilder, ReturnUrlVerifier}
import utils.SafeLogging

import scala.concurrent.Future
import formstack.{FormstackApi, FormstackForm}
import conf.switches.Switches

class FormstackController(
    returnUrlVerifier: ReturnUrlVerifier,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    authenticatedActions: AuthenticatedActions,
    formStackApi: FormstackApi,
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
      NotFound(views.html.formstack.formstackFormNotFound(page))
    }

  def complete: Action[AnyContent] =
    Action { implicit request =>
      if (Switches.IdentityFormstackSwitch.isSwitchedOn) {
        Ok(views.html.formstack.formstackComplete(page))
      } else {
        NotFound(views.html.errors._404())
      }
    }
}
