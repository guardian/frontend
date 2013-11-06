package services

import com.google.inject.{Inject, Singleton}
import conf.FrontendIdentityCookieDecoder
import client.Logging
import play.api.mvc.{SimpleResult, Request}
import idapiclient.ScGuU
import java.net.URLEncoder
import play.api.mvc.Results._
import scala.Some
import play.api.mvc.SimpleResult
import actions.AuthRequest


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
