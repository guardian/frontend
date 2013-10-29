package utils

import com.gu.identity.model.User
import play.api.mvc._
import scala.concurrent.{ExecutionContext, Future}
import play.api.mvc.SimpleResult
import play.api.mvc.Results
import idapiclient.{IdApiClient, UserCookie}
import client.{Auth, Response, Error}
import play.api.mvc.Results._
import com.google.inject.Inject
import services.{IdentityRequest, IdRequestParser}
import scala.concurrent.ExecutionContext.Implicits.global

class UserFromApiActionBuilder @Inject()(apiUserDataActionHandler:UserApiDataRequestHandler, idRequestParser: IdRequestParser, authService: AuthenticationService) extends ActionBuilder[UserFromApiRequest] with Results {
  protected def invokeBlock[A](request: Request[A], block: (UserFromApiRequest[A]) => Future[SimpleResult]) = {
    val authResult = authService.handleAuthenticatedRequest(request);
    val idRequest = idRequestParser(request)

    authResult.fold(
      { error =>
          Future.successful(error)},
      { auth =>
        apiUserDataActionHandler.handleRequest(request, auth).flatMap {
          case Left(error) => Future.successful(error)
          case Right(user) => block(UserFromApiRequest(user, idRequest, request, auth.auth))
        }
      }
    )
  }
}

class UserApiDataRequestHandler @Inject()(identityApiClient: IdApiClient) {
  def handleRequest[A](request: Request[A], authRequest: AuthRequest[A]): Future[Either[SimpleResult, User]] = {
    identityApiClient.me(authRequest.auth).map(apiResponse =>
      apiResponse.left.map {errors =>
        InternalServerError
      }
    )
  }
}


case class UserFromApiRequest[A] (user:User, identityRequest: IdentityRequest, request: Request[A], userAuth: Auth) extends WrappedRequest[A](request)
