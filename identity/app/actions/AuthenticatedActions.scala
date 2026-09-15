package actions

import actions.AuthenticatedActions.AuthRequest
import idapiclient.IdApiClient
import play.api.mvc.Security.AuthenticatedRequest
import play.api.mvc._
import services._
import utils.Logging
import scala.concurrent.{ExecutionContext, Future}
import navigation.AuthenticationComponentEvent._

object AuthenticatedActions {
  type AuthRequest[A] = AuthenticatedRequest[A, AuthenticatedUser]
}

class AuthenticatedActions(
    authService: AuthenticationService,
    identityApiClient: IdApiClient,
    identityUrlBuilder: IdentityUrlBuilder,
    controllerComponents: ControllerComponents,
) extends Logging
    with Results {

  private lazy val anyContentParser: BodyParser[AnyContent] = controllerComponents.parsers.anyContent
  private implicit lazy val ec: ExecutionContext = controllerComponents.executionContext

  private def redirectWithReturn(request: RequestHeader, path: String): Result = {
    val returnUrl = identityUrlBuilder.buildUrl(request.uri)

    val params = List("returnUrl" -> returnUrl) ++
      List(
        "INTCMP",
        "email",
        "CMP",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "clientId",
        "encryptedEmail",
        "autoSignInToken",
      ) // only forward these if they exist in original query string
        .flatMap(name =>
          request.getQueryString(name).map(value => name -> value),
        ) :+ createAuthenticationComponentEventTuple(SigninRedirect)

    val redirectUrlWithParams = identityUrlBuilder.appendQueryParams(path, params)

    SeeOther(identityUrlBuilder.buildUrl(redirectUrlWithParams))
  }

  def sendUserToSignin(request: RequestHeader): Result =
    redirectWithReturn(request, "/signin")

  def sendUserToReauthenticate(request: RequestHeader): Result =
    redirectWithReturn(request, "/reauthenticate")

  def sendUserToValidateEmail(request: RequestHeader): Result =
    redirectWithReturn(request, "/verify-email")

  private def checkRecentAuthenticationAndRedirect[A](request: Request[A]): Future[Either[Result, AuthRequest[A]]] =
    Future.successful {
      authService.fullyAuthenticatedUser(request) match {
        case Some(user) if user.hasRecentlyAuthenticated =>
          Right(new AuthenticatedRequest(user, request))
        case Some(_) =>
          Left(sendUserToReauthenticate(request))
        case None =>
          Left(sendUserToSignin(request))
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
            },
          )
        }
    }

  def emailValidationFilter: ActionFilter[AuthRequest] =
    new ActionFilter[AuthRequest] {
      override val executionContext = ec

      def filter[A](request: AuthRequest[A]): Future[Option[Result]] =
        Future.successful {
          if (request.user.statusFields.isUserEmailValidated)
            None
          else
            Some(sendUserToValidateEmail(request))
        }
    }

  // Play will not let you set up an ActionBuilder with a Refiner hence this empty actionBuilder to set up Auth
  private def noOpActionBuilder: DefaultActionBuilder = DefaultActionBuilder(anyContentParser)

}
