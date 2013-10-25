package utils

import play.api.mvc.{RequestHeader, SimpleResult, ActionBuilder, Request}
import com.gu.identity.model.User
import scala.concurrent.Future
import conf.FrontendIdentityCookieDecoder
import com.google.inject.{Singleton, Inject}
import play.api.mvc.Results._
import services.{IdentityUrlBuilder, IdRequestParser}
import play.mvc.BodyParser.AnyContent
import scala.language.implicitConversions
import java.net.URLEncoder
import client.Auth
import idapiclient.ScGuU


case class AuthRequest[A](request: Request[A], user: User, auth: Auth)
object AuthRequest {
  implicit def toRequest[A](authRequest: AuthRequest[A]): Request[A] = authRequest.request
}

@Singleton
class AuthAction @Inject()(cookieDecoder: FrontendIdentityCookieDecoder,
                           idRequestParser: IdRequestParser,
                           identityUrlBuilder: IdentityUrlBuilder)
  extends ActionBuilder[AuthRequest] with SafeLogging {

  protected def invokeBlock[A](request: Request[A], block: (AuthRequest[A]) => Future[SimpleResult]) = {
    request.cookies.get("SC_GU_U").flatMap { cookie =>
      cookieDecoder.getUserDataForScGuU(cookie.value).map { user =>
        AuthRequest(request, user, new ScGuU(cookie.value))
      }
    } match {
      case Some(authRequest) => {
        logger.trace("user is logged in")
        block(authRequest)
      }
      case None => {
        logger.debug("No user logged in, redirecting to signin")
        val returnUrl = URLEncoder.encode(identityUrlBuilder.buildUrl(request.uri), "UTF-8")
        Future.successful(SeeOther(identityUrlBuilder.buildUrl(s"/signin?returnUrl=$returnUrl")))
      }
    }
  }
}
