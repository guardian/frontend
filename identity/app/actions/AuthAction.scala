package actions

import play.api.mvc._
import scala.concurrent.Future
import com.google.inject.{Singleton, Inject}
import services.AuthenticationService
import play.api.mvc.SimpleResult
import utils.SafeLogging


@Singleton
class AuthAction @Inject()(authService: AuthenticationService)
  extends ActionBuilder[AuthRequest] with SafeLogging {

  protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]) = {
    authService.handleAuthenticatedRequest(request).fold(
      { error => Future.successful(error) },
      { auth => block(auth)}
    )
  }
}
