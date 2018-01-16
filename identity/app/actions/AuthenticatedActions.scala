package actions

import actions.AuthenticatedActions.AuthRequest
import com.gu.identity.model.User
import conf.switches.Switches.{IdentityAllowAccessToGdprJourneyPageSwitch, IdentityPointToConsentJourneyPage}
import idapiclient.IdApiClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import services._
import utils.Logging

import scala.concurrent.{ExecutionContext, Future}

object AuthenticatedActions {
  type AuthRequest[A] = AuthenticatedRequest[A, AuthenticatedUser]
}

class AuthenticatedActions(
    authService: AuthenticationService,
    identityApiClient: IdApiClient,
    identityUrlBuilder: IdentityUrlBuilder,
    controllerComponents: ControllerComponents,
    newsletterService: NewsletterService,
    idRequestParser: IdRequestParser,
    redirectDecisionService: RedirectDecisionService) extends Logging with Results {

  private lazy val anyContentParser: BodyParser[AnyContent] = controllerComponents.parsers.anyContent
  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  private def redirectWithReturn(request: RequestHeader, path: String): Result = {
    val returnUrl = identityUrlBuilder.buildUrl(request.uri)

    val redirectUrlWithParams = identityUrlBuilder.appendQueryParams(path, List(
      "INTCMP" -> "email",
      "returnUrl" -> returnUrl
    ))

    SeeOther(identityUrlBuilder.buildUrl(redirectUrlWithParams))
  }

  def sendUserToSignin(request: RequestHeader): Result =
    redirectWithReturn(request, "/signin")

  def sendUserToReauthenticate(request: RequestHeader): Result =
    redirectWithReturn(request, "/reauthenticate")

  def sendUserToRegister(request: RequestHeader): Result =
    redirectWithReturn(request, "/register")

  def sendUserToUserRedirectDecision(request: RequestHeader, decision: RedirectDecision): Result =
    redirectWithReturn(request, decision.url)

  private def checkIdApiForUserAndRedirect(request: RequestHeader) = {
    request.getQueryString("email") match {
      case None =>
        Future.successful(Left(sendUserToSignin(request)))

      case Some(email) =>
        identityApiClient.userFromQueryParam(email, "emailAddress").map {
          case Right(_) => Left(sendUserToSignin(request)) // user exists
          case Left(_) => Left(sendUserToRegister(request))
        }
    }
  }

  private def checkRecentAuthenticationAndRedirect[A](request: Request[A]): Future[Either[Result, AuthRequest[A]]] =
    Future.successful {
      authService.fullyAuthenticatedUser(request) match {
        case Some(user) if user.hasRecentlyAuthenticated =>
          Right(new AuthenticatedRequest(user, request))

        case _ =>
          Left(sendUserToReauthenticate(request))
      }
    }

  private def fullAuthRefiner: ActionRefiner[Request, AuthRequest] =
    new ActionRefiner[Request, AuthRequest] {
      override val executionContext = ec

      def refine[A](request: Request[A]) =
        authService.fullyAuthenticatedUser(request) match {
          case Some(userFromCookie) =>
            Future.successful(Right(new AuthenticatedRequest(userFromCookie, request)))

          case None =>
            checkIdApiForUserAndRedirect(request)
        }
    }

  private def consentAuthRefiner: ActionRefiner[Request, AuthRequest] =
    new ActionRefiner[Request, AuthRequest] {
      override val executionContext = ec

      def refine[A](request: Request[A]) =
        authService.consentAuthenticatedUser(request) match {
          case Some(userFormCookie) =>
            Future.successful(Right(new AuthenticatedRequest(userFormCookie, request)))

          case _ =>
            checkRecentAuthenticationAndRedirect(request)
        }
    }

  private def retrieveUserFromIdapiRefiner: ActionRefiner[AuthRequest, AuthRequest] =
    new ActionRefiner[AuthRequest, AuthRequest] {
      override val executionContext = ec

      def refine[A](request: AuthRequest[A]) =
        identityApiClient.me(request.user.auth).map {
          _.fold(
            errors => {
              logger.warn(s"Failed to look up logged-in user: $errors")
              Left(sendUserToSignin(request))
            },
            userDO => {
              logger.trace("user is logged in")
              Right(new AuthRequest(request.user.copy(user = userDO), request))
            }
          )
        }
    }

  private def apiUserShouldRepermissionFilter(enforceConsentsRedirection: Boolean = true): ActionFilter[AuthRequest] =
    new ActionFilter[AuthRequest] {
      override val executionContext = ec

      def filter[A](request: AuthRequest[A]) = {
        if (IdentityPointToConsentJourneyPage.isSwitchedOn && IdentityAllowAccessToGdprJourneyPageSwitch.isSwitchedOn)
          redirectDecisionService.decideValidateAndConsentRedirect(request.user, request).map {
            case Some(RedirectToEmailValidationStrictly) =>
              Some(sendUserToUserRedirectDecision(request, RedirectToEmailValidationStrictly))
            case Some(i: RedirectDecision) =>
              if (enforceConsentsRedirection) Some(sendUserToUserRedirectDecision(request, i)) else None
            case _ => None
          }
        else
          Future.successful(None)
      }
    }

  private def recentlyAuthenticatedRefiner: ActionRefiner[AuthRequest, AuthRequest] =
    new ActionRefiner[AuthRequest, AuthRequest] {
      override val executionContext = ec

      def refine[A](request: AuthRequest[A]) = checkRecentAuthenticationAndRedirect(request)
    }

  // Play will not let you set up an ActionBuilder with a Refiner hence this empty actionBuilder to set up Auth
  private def noOpActionBuilder: DefaultActionBuilder = DefaultActionBuilder(anyContentParser)

  /** SC_GU_U cookie present */
  def fullAuthAction: ActionBuilder[AuthRequest, AnyContent] =
    noOpActionBuilder andThen fullAuthRefiner

  /** SC_GU_U cookie present and user retrieved from IDAPI */
  def fullAuthWithIdapiUserAction: ActionBuilder[AuthRequest, AnyContent] =
    fullAuthAction andThen retrieveUserFromIdapiRefiner

  /** Recently obtained SC_GU_U cookie and user retrieved from IDAPI */
  def recentFullAuthWithIdapiUserAction: ActionBuilder[AuthRequest, AnyContent] =
    fullAuthAction andThen recentlyAuthenticatedRefiner andThen retrieveUserFromIdapiRefiner

  /** Auth with at least SC_GU_RP, that is, auth with SC_GU_U or else SC_GU_RP, and user retrieved from IDAPI */
  def consentAuthWithIdapiUserAction: ActionBuilder[AuthRequest, AnyContent] =
    noOpActionBuilder andThen consentAuthRefiner andThen retrieveUserFromIdapiRefiner

  /** Auth with at least SC_GU_RP and decideValidateAndConsentRedirect if user should be redirected to consent journey */
  def validationAndConsentJourneyRedirectAction(enforceConsentsRedirection: Boolean): ActionBuilder[AuthRequest, AnyContent] =
    consentAuthWithIdapiUserAction andThen apiUserShouldRepermissionFilter(enforceConsentsRedirection)

}
