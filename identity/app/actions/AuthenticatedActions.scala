package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import client.Logging
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import play.api.mvc.Results._
import play.api.mvc.Security.{AuthenticatedBuilder, AuthenticatedRequest}
import play.api.mvc.{Result, RequestHeader, ActionRefiner, Results}
import services.{AuthenticatedUser, AuthenticationService, IdentityUrlBuilder}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object AuthenticatedActions {
  type AuthRequest[A] = AuthenticatedRequest[A, AuthenticatedUser]
}

@Singleton
class AuthenticatedActions @Inject()(authService: AuthenticationService, identityApiClient: IdApiClient, identityUrlBuilder: IdentityUrlBuilder) extends Logging with Results {

  def redirectWithReturn(request: RequestHeader, path: String) = {
    val returnUrl = URLEncoder.encode(identityUrlBuilder.buildUrl(request.uri), "UTF-8")
    val signinUrl = request.getQueryString("INTCMP") match {
      case Some(campaignCode) => s"$path?INTCMP=$campaignCode&returnUrl=$returnUrl"
      case _ => s"$path?returnUrl=$returnUrl"
    }

  def sendUserToSignin(request: RequestHeader) = redirectWithReturn(request, "/signin")

  def sendUserToReauthenticate(request: RequestHeader) = redirectWithReturn(request, "/reauthenticate")

  def authAction = new AuthenticatedBuilder(authService.authenticatedUserFor(_), sendUserToSignin)

  def agreeAction(unAuthorizedCallback: (RequestHeader) => Result) = new AuthenticatedBuilder(authService.authenticatedUserFor(_), unAuthorizedCallback)

  def apiVerifiedUserRefiner() = new ActionRefiner[AuthRequest, AuthRequest] {
    def refine[A](request: AuthRequest[A]) = for (meResponse <- identityApiClient.me(request.user.auth)) yield {
      meResponse.left.map {
        errors =>
          logger.warn(s"Failed to look up logged-in user: $errors")
          sendUserToSignin(request)
      }.right.map {
        userFromApi =>
          logger.trace("user is logged in")
          new AuthRequest(request.user.copy(user = userFromApi), request)
      }
    }
  }

  def recentlyAuthenticatedRefiner() = new ActionRefiner[AuthRequest, AuthRequest] {
    def refine[A](request: AuthRequest[A]) = Future.successful {
      if (authService.recentlyAuthenticated(request)) Right(request) else Left(sendUserToReauthenticate(request))
    }
  }

  def authActionWithUser = authAction andThen apiVerifiedUserRefiner()

  def recentlyAuthenticated = authAction andThen recentlyAuthenticatedRefiner andThen apiVerifiedUserRefiner()
}
