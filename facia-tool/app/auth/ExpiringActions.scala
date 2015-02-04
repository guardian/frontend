package auth

import common.ExecutionContexts
import com.gu.googleauth.{GoogleAuthConfig, UserIdentity, AuthenticatedRequest, Actions}
import common.FaciaToolMetrics.ExpiredRequestCount
import play.api.mvc._
import controllers.routes
import scala.concurrent.Future
import play.api.mvc.Results._
import conf.Configuration
import org.joda.time.DateTime
import play.api.mvc.Call

object ExpiringActions extends implicits.Dates with implicits.Requests with ExecutionContexts {
  object AuthActions extends Actions {
    override def authConfig: GoogleAuthConfig = conf.GoogleAuth.getConfigOrDie

    val loginTarget: Call = routes.OAuthLoginController.login()

    override def sendForAuth[A](request:RequestHeader): Result =
      if (request.isXmlHttpRequest)
        Forbidden.withNewSession
      else
        super.sendForAuth(request)
  }

  private def withinAllowedTime(session: Session): Boolean = session.get(Configuration.cookies.lastSeenKey).map(new DateTime(_)).exists(_.age < Configuration.cookies.sessionExpiryTime)

  object ExpiringAuthAction {
    def async(f: Security.AuthenticatedRequest[AnyContent, UserIdentity] => Future[Result]) = AuthActions.AuthAction.async { request =>
      if (withinAllowedTime(request.session)) {
        f(request).map(_.withSession(request.session + (Configuration.cookies.lastSeenKey , DateTime.now.toString)))
      }
      else {
        ExpiredRequestCount.increment()
        if (request.isXmlHttpRequest)
          Future.successful(Forbidden.withNewSession)
        else {
          Future.successful(AuthActions.sendForAuth(request))
        }
      }
    }

    def apply(f: Security.AuthenticatedRequest[AnyContent, UserIdentity] => Result) = async(request => Future.successful(f(request)))
  }
}
