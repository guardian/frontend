package utils

import com.gu.identity.model.User
import play.api.mvc._
import scala.concurrent.{ExecutionContext, Future}
import play.api.mvc.SimpleResult
import play.api.mvc.Results
import idapiclient.{IdApiClient, UserCookie}
import client.{Response, Error}
import play.api.mvc.Results._
import com.google.inject.Inject
import services.{IdentityRequest, IdRequestParser}
import scala.concurrent.ExecutionContext.Implicits.global

class UserFromApiActionBuilder @Inject()(apiUserDataActionHandler:UserApiDataRequestHandler, idRequestParser: IdRequestParser) extends ActionBuilder[UserFromApiRequest] with Results {
  protected def invokeBlock[A](request: Request[A], block: (UserFromApiRequest[A]) => Future[SimpleResult]) = {
    apiUserDataActionHandler
      .handleRequest(request)
      .flatMap { userResponse =>
        userResponse.fold (
          { Future.successful(_) },
          { user => block(UserFromApiRequest(user, idRequestParser(request), request)) }
      )
    }
  }
}

class UserApiDataRequestHandler @Inject()(identityApiClient: IdApiClient) {
  def handleRequest(request: Request[_]): Future[Either[SimpleResult, User]] = {
    request
      .cookies
      .get("SC_GU_U")
      .map { scGuUCookie =>
      identityApiClient.me(UserCookie(scGuUCookie.value)).map(apiResponse =>
        apiResponse.left.map {errors =>
          InternalServerError
        }
      )
    }.get
  }
}


case class UserFromApiRequest[A] (user:User, identityRequest: IdentityRequest, request: Request[A]) extends WrappedRequest[A](request)
