package controllers

import actions.AuthenticatedActions
import play.api.mvc._
import model.IdentityPage
import common.ExecutionContexts
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging
import scala.concurrent.Future
import formstack.{FormstackApi, FormstackForm}
import conf.switches.Switches

@Singleton
class FormstackController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                    idRequestParser: IdRequestParser,
                                    idUrlBuilder: IdentityUrlBuilder,
                                    authenticatedActions: AuthenticatedActions,
                                    formStackApi: FormstackApi)
  extends Controller with ExecutionContexts with SafeLogging {

  import authenticatedActions.authAction

  val page = IdentityPage("/form", "Form", "formstack")

  def formstackForm(formReference: String, composer: Boolean) = authAction.async { implicit request =>
    if (Switches.IdentityFormstackSwitch.isSwitchedOn) {
      FormstackForm.extractFromSlug(formReference).map { formstackForm =>
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
      }.getOrElse {
        Future.successful(NotFound(views.html.formstack.formstackFormNotFound(page)))
      }
    } else {
      logger.info(s"formstack switched off, attempt to access $formReference failed")
      Future.successful(NotFound(views.html.errors._404()))
    }
  }

  def complete = Action { implicit request =>
    if (Switches.IdentityFormstackSwitch.isSwitchedOn) {
      Ok(views.html.formstack.formstackComplete(page))
    } else {
      NotFound(views.html.errors._404())
    }
  }
}
