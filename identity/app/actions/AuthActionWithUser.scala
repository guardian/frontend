package actions

import play.api.mvc._
import scala.concurrent.Future
import play.api.mvc.Results
import idapiclient.IdApiClient
import com.google.inject.Inject
import services.{AuthenticationService, IdRequestParser}
import scala.concurrent.ExecutionContext.Implicits.global
import utils.SafeLogging
import play.api.mvc.SimpleResult

class AuthActionWithUser @Inject()(authService: AuthenticationService, identityApiClient: IdApiClient, idRequestParser: IdRequestParser)
  extends ActionBuilder[AuthRequest] with Results with SafeLogging {

  protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]) = {
    val authResult = authService.handleAuthenticatedRequest(request)
    authResult.fold(
      error => {
          Future.successful(error)
      },
      auth => {
        identityApiClient.me(auth.auth).flatMap {
          case Left(errors) => {
            logger.warn(s"Failed to look up logged-in user: $errors")
            Future.failed(new RuntimeException(s"Failed to look up logged-in user: $errors"))
          }
          case Right(user) => block(AuthRequest(request, user, auth.auth))
        }
      }
    )
  }
}
