package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import utils.Logging
import idapiclient.IdApiClient
import play.api.mvc.Security.{AuthenticatedBuilder, AuthenticatedRequest}
import play.api.mvc._
import services.{AuthenticatedUser, AuthenticationService, IdentityUrlBuilder}

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
    val signinUrl = request.getQueryString("INTCMP") match {
      case Some(campaignCode) => s"$path?INTCMP=$campaignCode&returnUrl=$returnUrl"
      case _ => s"$path?returnUrl=$returnUrl"
    }

    SeeOther(identityUrlBuilder.buildUrl(signinUrl))
  }

  def sendUserToSignin(request: RequestHeader): Result =
    redirectWithReturn(request, "/signin")

  def sendUserToReauthenticate(request: RequestHeader): Result =
    redirectWithReturn(request, "/reauthenticate")

  def sendUserToRegister(request: RequestHeader) : Result =
    redirectWithReturn(request, "/register")

  def authRefiner: ActionRefiner[Request, AuthRequest] = new ActionRefiner[Request, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: Request[A]) =
      authService.authenticatedUserFor(request) match {
        case Some(authenticatedUser) => Future.successful(Right(new AuthenticatedRequest(authenticatedUser, request)))
        case None =>
          // If an email query param exists we want to check the DB for the user and redirect them to signin/register
          val email =request.getQueryString("email")

          email.map(e => identityApiClient.userFromQueryParam(e, "emailAddress").map {
              case Right(userExists)=> Left(sendUserToSignin(request))
              case Left(err) => Left(sendUserToRegister(request))
          }.recover { case e: Exception =>
            Left(sendUserToRegister(request))
          }).getOrElse(Future.successful(Left(sendUserToSignin(request))))
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

  def recentlyAuthenticatedRefiner: ActionRefiner[AuthRequest, AuthRequest] = new ActionRefiner[AuthRequest, AuthRequest] {
    override val executionContext = ec

    def refine[A](request: AuthRequest[A]) = Future.successful {
      if (authService.recentlyAuthenticated(request)) Right(request) else Left(sendUserToReauthenticate(request))
    }
  }


  def authAction: AuthenticatedBuilder[AuthenticatedUser] =
    new AuthenticatedBuilder(authService.authenticatedUserFor, anyContentParser, sendUserToSignin)

  def authActionWithUser: ActionBuilder[AuthRequest, AnyContent] =
    DefaultActionBuilder(anyContentParser) andThen authRefiner andThen apiVerifiedUserRefiner

  def recentlyAuthenticated: ActionBuilder[AuthRequest, AnyContent] =
    DefaultActionBuilder(anyContentParser) andThen authRefiner andThen recentlyAuthenticatedRefiner andThen apiVerifiedUserRefiner

}
