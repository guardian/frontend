package services

import cats.effect.IO
import com.gu.identity.auth.{IdapiAuthService, IdapiUserCredentials}
import com.gu.identity.cookie.IdentityCookieService
import com.gu.identity.model.User
import idapiclient.{Auth, ScGuRp, ScGuU}
import org.joda.time.Hours
import play.api.mvc.{Cookie, RequestHeader, Results}
import utils.SafeLogging

import scala.language.implicitConversions

object AuthenticatedUser {
  implicit def authUserToUser(authUser: AuthenticatedUser): User = authUser.user
}

case class AuthenticatedUser(user: User, auth: Auth, hasRecentlyAuthenticated: Boolean = false)

class AuthenticationService(
    identityAuthService: IdapiAuthService,
    identityCookieService: IdentityCookieService,
) extends Results
    with SafeLogging {

  private def hasRecentlyAuthenticate(identityId: String, request: RequestHeader): Boolean =
    request.cookies.get("SC_GU_LA").fold(false) { cookie =>
      identityCookieService
        .userHasAuthenticatedWithinDurationFromSCGULACookie(Hours.hours(1).toStandardDuration, identityId, cookie.value)
    }

  /** User has SC_GU_U and GU_U cookies */
  def fullyAuthenticatedUser(request: RequestHeader): Option[AuthenticatedUser] = {

    case class UserCredentialsMissingError(message: String) extends Exception {
      override def getMessage: String = message
    }

    def getSCGUUCookieFromRequest(request: RequestHeader): IO[Cookie] =
      IO.fromEither(request.cookies.get("SC_GU_U").toRight(UserCredentialsMissingError("SC_GU_U cookie not set")))

    def getIdapiUserCredentialsFromRequest(
        request: RequestHeader,
    ): IO[IdapiUserCredentials] =
      getSCGUUCookieFromRequest(request).redeemWith(
        err => IO.raiseError[IdapiUserCredentials](err),
        cookie => IO(IdapiUserCredentials.SCGUUCookie(cookie.value)),
      )

    (for {
      credentials <- getIdapiUserCredentialsFromRequest(request)
      user <- identityAuthService.getUserFromCredentials(credentials)
    } yield {
      // have to explicitly match the retrieved credentials to UserCredentials to see if it's an SCGUUCookie or CryptoAccessToken
      // in this case we're only looking for the SCGUUCookie, so return the value of that
      val cookie = credentials match {
        case IdapiUserCredentials.SCGUUCookie(value)      => value
        case IdapiUserCredentials.CryptoAccessToken(_, _) => ""
      }
      AuthenticatedUser(
        user = user,
        auth = ScGuU(cookie),
        hasRecentlyAuthenticated = hasRecentlyAuthenticate(user.id, request),
      )
    }).redeem(
      err => {
        logger.error("unable to authenticate user using SC_GU_U cookie", err)
        None
      },
      user => Some(user),
    ).unsafeRunSync()
  }

  def consentCookieAuthenticatedUser(request: RequestHeader): Option[AuthenticatedUser] =
    for {
      scGuRp <- request.cookies.get("SC_GU_RP")
      userFromScGuRp <- identityCookieService.getUserDataFromSCGURPCookie(scGuRp.value)
    } yield AuthenticatedUser(userFromScGuRp, ScGuRp(scGuRp.value))
}
