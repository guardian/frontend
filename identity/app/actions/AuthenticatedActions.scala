package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import conf.switches.Switches.{IdentityAllowAccessToGdprJourneyPageSwitch, IdentityPointToConsentJourneyPage}
import idapiclient.IdApiClient
import play.api.mvc.Security.{AuthenticatedBuilder, AuthenticatedRequest}
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
    idRequestParser: IdRequestParser) extends Logging with Results {

  private val anyContentParser: BodyParser[AnyContent] = controllerComponents.parsers.anyContent
  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  def redirectWithReturn(request: RequestHeader, path: String): Result = {
    val returnUrl = identityUrlBuilder.buildUrl(request.uri)

    val redirectUrlWithParams = identityUrlBuilder.appendQueryParams(path, List(
      "INTCMP" -> "email",
      "returnUrl" -> returnUrl
    ))

    SeeOther(identityUrlBuilder.buildUrl(redirectUrlWithParams))
  }

  def sendUserToAllConsentsJourney(request: RequestHeader): Result =
    redirectWithReturn(request, "/consents/all")

  def sendUserToNewslettersConsentsJourney(request: RequestHeader): Result =
    redirectWithReturn(request, "/consents/newsletters")

  def sendUserToSignin(request: RequestHeader): Result =
    redirectWithReturn(request, "/signin")

  def sendUserToReauthenticate(request: RequestHeader): Result =
    redirectWithReturn(request, "/reauthenticate")

  def sendUserToRegister(request: RequestHeader): Result =
    redirectWithReturn(request, "/register")

  private def checkIdApiForUserAndRedirect(request: RequestHeader) = {
    request.getQueryString("email") match {
      case None => Future.successful(Left(sendUserToSignin(request)))
      case Some(email) =>
        identityApiClient.userFromQueryParam(email, "emailAddress").map {
          case Right(_) => Left(sendUserToSignin(request)) // user exists
          case Left(_) => Left(sendUserToRegister(request))
        }
    }
  }

  def checkRecentAuthenticationAndRedirect[A](request: Request[A]): Future[Either[Result, AuthRequest[A]]] = Future.successful {
    authService.authenticatedUserFor(request) match {
      case Some(user) if user.hasRecentlyAuthenticated => Right(new AuthenticatedRequest(user, request))
      case _ => Left(sendUserToReauthenticate(request))
    }
  }

  def authRefiner: ActionRefiner[Request, AuthRequest] = new ActionRefiner[Request, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: Request[A]) =
      authService.authenticatedUserFor(request) match {
        case Some(authenticatedUser) => Future.successful(Right(new AuthenticatedRequest(authenticatedUser, request)))
        case None => checkIdApiForUserAndRedirect(request)
      }
  }

  def permissionRefiner: ActionRefiner[Request, AuthRequest] = new ActionRefiner[Request, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: Request[A]) =
      authService.authenticateUserForPermissions(request) match {
        case Some(permUser) => Future.successful(Right(new AuthenticatedRequest(permUser, request)))
        case _ => checkRecentAuthenticationAndRedirect(request)
      }
  }

  def agreeAction(unAuthorizedCallback: (RequestHeader) => Result): AuthenticatedBuilder[AuthenticatedUser] =
    new AuthenticatedBuilder(authService.authenticatedUserFor, anyContentParser, unAuthorizedCallback)

  def apiVerifiedUserRefiner: ActionRefiner[AuthRequest, AuthRequest] = new ActionRefiner[AuthRequest, AuthRequest] {
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

  def apiUserShouldRepermissionRefiner: ActionRefiner[AuthRequest, AuthRequest] = new ActionRefiner[AuthRequest, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: AuthRequest[A]) =
      if (IdentityPointToConsentJourneyPage.isSwitchedOn && IdentityAllowAccessToGdprJourneyPageSwitch.isSwitchedOn)
        decideConsentJourney(request)
      else
        Future.successful(Right(request))

    private def decideConsentJourney[A](request: AuthRequest[A]) =
      if (userHasRepermissioned(request))
        newsletterService.subscriptions(request.user.getId, idRequestParser(request).trackingData).map { emailFilledForm =>
          if (newsletterService.getV1EmailSubscriptions(emailFilledForm).isEmpty)
            Right(request)
          else
            Left(sendUserToNewslettersConsentsJourney(request))
        }
      else Future.successful(Left(sendUserToAllConsentsJourney(request)))

    private def userHasRepermissioned[A](request: AuthRequest[A]): Boolean =
      request.user.statusFields.hasRepermissioned.contains(true)
}

  def recentlyAuthenticatedRefiner: ActionRefiner[AuthRequest, AuthRequest] = new ActionRefiner[AuthRequest, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: AuthRequest[A]) = checkRecentAuthenticationAndRedirect(request)
  }
  // Play will not let you set up an ActionBuilder with a Refiner hence this empty actionBuilder to set up Auth
  def noOpActionBuilder: DefaultActionBuilder = DefaultActionBuilder(anyContentParser)

  def authAction: ActionBuilder[AuthRequest, AnyContent] =
    noOpActionBuilder andThen authRefiner

  def authActionWithUser: ActionBuilder[AuthRequest, AnyContent] =
    authAction andThen apiVerifiedUserRefiner

  def recentlyAuthenticated: ActionBuilder[AuthRequest, AnyContent] =
    authAction andThen recentlyAuthenticatedRefiner andThen apiVerifiedUserRefiner

  def authWithConsentRedirectAction: ActionBuilder[AuthRequest, AnyContent] =
    recentlyAuthenticated andThen apiUserShouldRepermissionRefiner

  def authWithRPCookie: ActionBuilder[AuthRequest, AnyContent] =
    noOpActionBuilder andThen permissionRefiner andThen apiVerifiedUserRefiner

}
