package actions

import play.api.mvc._
import scala.concurrent.Future
import com.google.inject.{Singleton, Inject}
import services.AuthenticationService
import play.api.mvc.Result
import utils.SafeLogging


@Singleton
class AuthenticatedAction @Inject()(authService: AuthenticationService)
  extends ActionBuilder[AuthRequest] with SafeLogging {

  def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[Result]) = {
    authService.handleAuthenticatedRequest(request).fold(
      { error => Future.successful(error) },
      { auth => block(auth)}
    )
  }
}
