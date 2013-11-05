package utils

import play.api.mvc._
import com.gu.identity.model.User
import scala.concurrent.Future
import conf.FrontendIdentityCookieDecoder
import com.google.inject.{Singleton, Inject}
import play.api.mvc.Results._
import services.{IdentityUrlBuilder, IdRequestParser}
import java.net.URLEncoder
import client.{Response, Logging, Auth}
import idapiclient.ScGuU
import scala.Some
import play.api.mvc.SimpleResult


case class AuthRequest[A](request: Request[A], user: User, auth: Auth) extends WrappedRequest(request)

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


@Singleton
class AuthenticationService @Inject()(cookieDecoder: FrontendIdentityCookieDecoder,
                                      idRequestParser: IdRequestParser,
                                      identityUrlBuilder: IdentityUrlBuilder) extends Logging {
  def handleAuthenticatedRequest[A](request: Request[A]): Either[SimpleResult, AuthRequest[A]] = {
    request.cookies.get("SC_GU_U").flatMap { cookie =>
      cookieDecoder.getUserDataForScGuU(cookie.value).map { user =>
        AuthRequest(request, user, new ScGuU(cookie.value))
      }
    } match {
      case Some(authRequest) => {
        logger.trace("user is logged in")
        Right(authRequest)
      }
      case None => {
        logger.debug("No user logged in, redirecting to signin")
        val returnUrl = URLEncoder.encode(identityUrlBuilder.buildUrl(request.uri), "UTF-8")
        Left(SeeOther(identityUrlBuilder.buildUrl(s"/signin?returnUrl=$returnUrl")))
      }
    }
  }
}
