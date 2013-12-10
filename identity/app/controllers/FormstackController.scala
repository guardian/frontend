package controllers

import play.api.mvc._
import model.IdentityPage
import common.ExecutionContexts
import services.{IdentityUrlBuilder, IdRequestParser, ReturnUrlVerifier}
import com.google.inject.{Inject, Singleton}
import utils.SafeLogging


@Singleton
class FormstackController @Inject()(returnUrlVerifier: ReturnUrlVerifier,
                                        idRequestParser: IdRequestParser,
                                        idUrlBuilder: IdentityUrlBuilder,
                                        authAction: utils.AuthAction)
  extends Controller with ExecutionContexts with SafeLogging {

  val page = IdentityPage("/form", "Form", "formstack")

  def formstackForm(formId: String) = authAction.apply { implicit request =>
    Ok(views.html.formstack.formstackForm(page, formId))
  }
}
