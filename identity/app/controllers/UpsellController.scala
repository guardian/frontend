package controllers

import actions.AuthenticatedActions
import common.ImplicitControllerExecutionContext
import conf.switches.IdentitySwitches
import conf.IdentityConfiguration
import controllers.UpsellPages.ConfirmEmailThankYou
import controllers.DiscardingIdentityCookies.discardingCookieForRootDomain
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
  sealed abstract class UpsellPage(id: String) extends IdentityPage(id, "Thank You") {
    def jsName: String = id.drop(1).replaceAllLiterally("/", "-")
    override val isFlow = true;
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
    signInService: PlaySigninService,
    conf: IdentityConfiguration,
    returnUrlVerifier: ReturnUrlVerifier,
    val controllerComponents: ControllerComponents,
    val httpConfiguration: HttpConfiguration,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging
    with IdentitySwitches {

  import UpsellController._

  def confirmEmailThankYou(returnUrl: Option[String]): Action[AnyContent] =
    csrfAddToken {
      authenticatedActions.consentAuthWithIdapiUserWithEmailValidation.async { implicit request =>
        val returnUrl = returnUrlVerifier.getVerifiedReturnUrl(request)
        val email = request.user.primaryEmailAddress
        val hasPassword = request.user.hasPassword.getOrElse(true)
        val hasSocialLinks = request.user.socialLinks.nonEmpty
        val view = views.html.upsell.upsellContainer(
          ConfirmEmailThankYou,
          idRequestParser(request),
          idUrlBuilder,
          returnUrl.getOrElse(returnUrlVerifier.defaultReturnUrl),
          email,
          hasPassword,
          hasSocialLinks,
        )
        Future(
          NoCache(
            Ok(IdentityHtmlPage.html(view)(ConfirmEmailThankYou, request, context))
            // The value of this cookie is getting injected into the HTML for use by javascript,
            // therefore, it can be unset as a cookie.
              .discardingCookies(discardingCookieForRootDomain(passwordResetCookie)),
          ),
        )
      }
    }
}

object UpsellController {
  val passwordResetCookie = "SC_GU_GUEST_PW_SET"
}
