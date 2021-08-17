package services

import com.gu.identity.auth.UserCredentials
import idapiclient.{Auth, ScGuRp, ScGuU}
import com.gu.identity.model.User
import com.gu.identity.cookie.IdentityCookieService
import com.gu.identity.play.IdentityPlayAuthService
import play.api.mvc.{RequestHeader, Results}
import org.joda.time.Hours
import utils.SafeLogging

import scala.language.implicitConversions

object AuthenticatedUser {
  implicit def authUserToUser(authUser: AuthenticatedUser): User = authUser.user
}

case class AuthenticatedUser(user: User, auth: Auth, hasRecentlyAuthenticated: Boolean = false)

class AuthenticationService(
    identityAuthService: IdentityPlayAuthService,
    identityCookieService: IdentityCookieService,
) extends Results
    with SafeLogging {

  private def hasRecentlyAuthenticate(identityId: String, request: RequestHeader): Boolean =
    request.cookies.get("SC_GU_LA").fold(false) { cookie =>
      identityCookieService
        .userHasAuthenticatedWithinDurationFromSCGULACookie(Hours.hours(1).toStandardDuration, identityId, cookie.value)
    }

  /** User has SC_GU_U and GU_U cookies */
  def fullyAuthenticatedUser[A](request: RequestHeader): Option[AuthenticatedUser] = {
    identityAuthService
      .getUserFromRequest(request)
      .map {
        case (credentials, user) =>
          // have to explicitly match the retrieved credentials to UserCredentials to see if it's an SCGUUCookie or CryptoAccessToken
          // in this case we're only looking for the SCGUUCookie, so return the value of that
          val cookie = credentials match {
            case UserCredentials.SCGUUCookie(value)      => value
            case UserCredentials.CryptoAccessToken(_, _) => ""
          }
          AuthenticatedUser(
            user = user,
            auth = ScGuU(cookie),
            hasRecentlyAuthenticated = hasRecentlyAuthenticate(user.id, request),
          )
      }
      .redeem(
        err => {
          logger.error("unable to authenticate user using SC_GU_U cookie", err)
          None
        },
        user => Some(user),
      )
      .unsafeRunSync()
  }

  def consentCookieAuthenticatedUser(request: RequestHeader): Option[AuthenticatedUser] =
    for {
      scGuRp <- request.cookies.get("SC_GU_RP")
      userFromScGuRp <- identityCookieService.getUserDataFromSCGURPCookie(scGuRp.value)
    } yield AuthenticatedUser(userFromScGuRp, ScGuRp(scGuRp.value))
}
