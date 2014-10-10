package actions

import java.net.URLEncoder

import actions.AuthenticatedActions.AuthRequest
import client.Logging
import com.google.inject.{Inject, Singleton}
import idapiclient.IdApiClient
import play.api.mvc.Security.{AuthenticatedBuilder, AuthenticatedRequest}
import play.api.mvc.{ActionRefiner, RequestHeader, Results}
import services.{AuthenticatedUser, AuthenticationService, IdentityUrlBuilder}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object AuthenticatedActions {
  type AuthRequest[A] = AuthenticatedRequest[A, AuthenticatedUser]
}

@Singleton
class AuthenticatedActions @Inject()(authService: AuthenticationService, identityApiClient: IdApiClient, identityUrlBuilder: IdentityUrlBuilder) extends Logging with Results {

  def sendUserToSignin(request: RequestHeader) = {
    val returnUrl = URLEncoder.encode(identityUrlBuilder.buildUrl(request.uri), "UTF-8")
    SeeOther(identityUrlBuilder.buildUrl(s"/signin?returnUrl=$returnUrl"))
  }

  def authAction = new AuthenticatedBuilder(authService.authenticatedUserFor(_), sendUserToSignin)

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
      if (authService.recentlyAuthenticated(request)) Right(request) else Left(sendUserToSignin(request))
    }
  }

  def authActionWithUser = authAction andThen apiVerifiedUserRefiner()

  def recentlyAuthenticated = authAction andThen recentlyAuthenticatedRefiner andThen apiVerifiedUserRefiner()
}