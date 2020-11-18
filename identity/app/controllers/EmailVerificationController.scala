package controllers


import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import idapiclient.IdApiClient
import services.{AuthenticationService, IdRequestParser, IdentityUrlBuilder, PlaySigninService, ReturnUrlVerifier}
import common.ImplicitControllerExecutionContext
import utils.SafeLogging
import model.{ApplicationContext, IdentityPage}
import actions.AuthenticatedActions
import pages.IdentityHtmlPage
import scala.concurrent.Future

class EmailVerificationController(
    api: IdApiClient,
    authenticatedActions: AuthenticatedActions,
    authenticationService: AuthenticationService,
    idRequestParser: IdRequestParser,
    idUrlBuilder: IdentityUrlBuilder,
    returnUrlVerifier: ReturnUrlVerifier,
    signinService: PlaySigninService,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends BaseController
    with ImplicitControllerExecutionContext
    with SafeLogging {

  import authenticatedActions.fullAuthWithIdapiUserAction


  def completeRegistration(): Action[AnyContent] =
    fullAuthWithIdapiUserAction.async { implicit request =>
      val idRequest = idRequestParser(request)
      val page = IdentityPage("/complete-registration", "Complete Signup", isFlow = true)
      val verifiedReturnUrlAsOpt = returnUrlVerifier.getVerifiedReturnUrl(request)

      Future.successful(
        Ok(
          IdentityHtmlPage.html(
            views.html.verificationEmailResent(
              request.user,
              idRequest,
              idUrlBuilder,
              verifiedReturnUrlAsOpt,
              returnUrlVerifier.defaultReturnUrl,
              isSignupFlow = true,
            ),
          )(page, request, context),
        ),
      )
    }

}
