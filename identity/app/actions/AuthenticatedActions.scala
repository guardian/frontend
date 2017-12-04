package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import utils.Logging
import idapiclient.IdApiClient
import play.api.mvc.Security.{AuthenticatedBuilder, AuthenticatedRequest}
import play.api.mvc._
import services.{AuthenticatedUser, AuthenticationService, IdentityUrlBuilder}
import conf.switches.Switches.IdentityRedirectUsersWithLingeringV1ConsentsSwitch


import scala.concurrent.{ExecutionContext, Future}

object AuthenticatedActions {
  type AuthRequest[A] = AuthenticatedRequest[A, AuthenticatedUser]
}

class AuthenticatedActions(
    authService: AuthenticationService,
    identityApiClient: IdApiClient,
    identityUrlBuilder: IdentityUrlBuilder,
    controllerComponents: ControllerComponents) extends Logging with Results {

  private val anyContentParser: BodyParser[AnyContent] = controllerComponents.parsers.anyContent
  private implicit val ec: ExecutionContext = controllerComponents.executionContext

  def redirectWithReturn(request: RequestHeader, path: String): Result = {
    val returnUrl = URLEncoder.encode(identityUrlBuilder.buildUrl(request.uri), "UTF-8")

    val paramsToPass =
      List("INTCMP", "email")
        .flatMap(name => request.getQueryString(name).map(value => s"&$name=$value"))
        .mkString

    val signinUrl = s"$path?returnUrl=$returnUrl$paramsToPass"

    SeeOther(identityUrlBuilder.buildUrl(signinUrl))
  }

  def sendUserToConsentJourney(request: RequestHeader): Result =
    redirectWithReturn(request, "/consent?journey=repermission")

  def sendUserToNarrowConsentJourney(request: RequestHeader): Result =
    redirectWithReturn(request, "/consent?journey=repermission-narrow")

  def sendUserToSignin(request: RequestHeader): Result =
    redirectWithReturn(request, "/signin")

  def sendUserToReauthenticate(request: RequestHeader): Result =
    redirectWithReturn(request, "/reauthenticate")

  def sendUserToRegister(request: RequestHeader) : Result =
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

  def authRefiner: ActionRefiner[Request, AuthRequest] = new ActionRefiner[Request, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: Request[A]) =
      authService.authenticatedUserFor(request) match {
        case Some(authenticatedUser) => Future.successful(Right(new AuthenticatedRequest(authenticatedUser, request)))
        case None => checkIdApiForUserAndRedirect(request)
      }
  }

  def agreeAction(unAuthorizedCallback: (RequestHeader) => Result): AuthenticatedBuilder[AuthenticatedUser] =
    new AuthenticatedBuilder(authService.authenticatedUserFor, anyContentParser, unAuthorizedCallback)

  def apiVerifiedUserRefiner: ActionRefiner[AuthRequest, AuthRequest] = new ActionRefiner[AuthRequest, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: AuthRequest[A]) =
      identityApiClient.me(request.user.auth).map { _.fold(
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
    //TODO: verify if the user reperm'd instead of validate. also verify v1 email subs
    def refine[A](request: AuthRequest[A]) = Future.successful {
      if(IdentityRedirectUsersWithLingeringV1ConsentsSwitch.isSwitchedOn) {
        request.user.statusFields.userEmailValidated match {
          case Some(true) => Left(sendUserToConsentJourney(request));
          case _ => Right(request);
        }
      }
      else {
        Right(request);
      }
    }
  }

  def recentlyAuthenticatedRefiner: ActionRefiner[AuthRequest, AuthRequest] = new ActionRefiner[AuthRequest, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: AuthRequest[A]) = Future.successful {
      if (authService.recentlyAuthenticated(request)) Right(request) else Left(sendUserToReauthenticate(request))
    }
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

}
