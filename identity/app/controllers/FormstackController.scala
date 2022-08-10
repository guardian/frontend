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

  import authenticatedActions.fullAuthAction

  val page = IdentityPage("/form", "Form")

  def formstackFormEmbed(formReference: String): Action[AnyContent] =
    formstackForm(formReference, true)

  def formstackForm(formReference: String, composer: Boolean): Action[AnyContent] =
    fullAuthAction.async { implicit request =>
      if (Switches.IdentityFormstackSwitch.isSwitchedOn) {
        FormstackForm
          .extractFromSlug(formReference)
          .map { formstackForm =>
            formStackApi.checkForm(formstackForm).map {
              case Right(_) => {
                logger.trace(s"Rendering formstack form ${formstackForm.formId}")
                if (composer) {
                  Ok(views.html.formstack.formstackFormComposer(page, formstackForm))
                } else {
                  Ok(views.html.formstack.formstackForm(page, formstackForm))
                }
              }
              case Left(errors) => {
                logger.warn(s"Unable to render formstack form ${formstackForm.formReference}, $errors")
                new Status(errors.map(_.statusCode).max)(views.html.formstack.formstackFormNotFound(page))
              }
            }
          }
          .getOrElse {
            Future.successful(NotFound(views.html.formstack.formstackFormNotFound(page)))
          }
      } else {
        logger.info(s"formstack switched off, attempt to access $formReference failed")
        Future.successful(NotFound(views.html.errors._404()))
      }
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
