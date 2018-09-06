package controllers

import actions.AuthenticatedActions
import common.ImplicitControllerExecutionContext
import conf.IdentityConfiguration
import controllers.UpsellPages.ConfirmEmailThankYou
import idapiclient.IdApiClient
import model.{ApplicationContext, IdentityPage, NoCache}
import pages.IdentityHtmlPage
import play.api.http.HttpConfiguration
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import play.filters.csrf.{CSRFAddToken, CSRFCheck}
import services._
import utils.SafeLogging

import scala.concurrent.Future

object UpsellPages {
  sealed abstract class UpsellPage(id: String)
    extends IdentityPage(id, "Thank You") {
    def jsName: String = id.drop(1).replaceAllLiterally("/", "-")
  }

  object ConfirmEmailThankYou extends UpsellPage("/confirm-email/thank-you")
}

class UpsellController(
   idApiClient: IdApiClient,
   authenticatedActions: AuthenticatedActions,
   authenticationService: AuthenticationService,
   idRequestParser: IdRequestParser,
   idUrlBuilder: IdentityUrlBuilder,
   csrfCheck: CSRFCheck,
   csrfAddToken: CSRFAddToken,
   signInService : PlaySigninService,
   conf: IdentityConfiguration,
   returnUrlVerifier: ReturnUrlVerifier,
   val controllerComponents: ControllerComponents,
   val httpConfiguration: HttpConfiguration
 )(implicit context: ApplicationContext)
  extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  def confirmEmailThankYou(returnUrl: Option[String]): Action[AnyContent] = Action.async { implicit request =>
    val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
    val view = views.html.upsell.upsellContainer(
      ConfirmEmailThankYou, idRequestParser(request), idUrlBuilder, returnUrl.getOrElse(returnUrlVerifier.defaultReturnUrl))
    Future(NoCache(Ok(
      IdentityHtmlPage.html(view)(ConfirmEmailThankYou, request, context)
    )))
  }

}
