package services

import idapiclient.{Auth, ScGuRp, ScGuU}
import com.gu.identity.model.User
import com.gu.identity.play.IdentityPlayAuthService
import play.api.mvc.{RequestHeader, Results}
import org.joda.time.{Duration, Hours}
import utils.SafeLogging

import scala.language.implicitConversions

// This is a place holder for the cookie service that will be provided by identity-cookie.
class IdentityCookieService {

  def hasAuthenticatedWithin(duration: Duration, identityId: String, scGuLaCookie: String): Boolean = ???

  def getUserDataForGuRp(cookie: String): Option[User] = ???
}

object AuthenticatedUser {
  implicit def authUserToUser(authUser: AuthenticatedUser): User = authUser.user
}

case class AuthenticatedUser(
  user: User,
  auth: Auth,
  hasRecentlyAuthenticated: Boolean = false)

class AuthenticationService(
  identityAuthService: IdentityPlayAuthService,
  identityCookieService: IdentityCookieService
) extends Results with SafeLogging {

  private def hasRecentlyAuthenticate(identityId: String, request: RequestHeader): Boolean =
    request.cookies.get("SC_GU_LA").fold(false) { cookie =>
      identityCookieService.hasAuthenticatedWithin(Hours.hours(1).toStandardDuration, identityId, cookie.value)
    }

  /** User has SC_GU_U and GU_U cookies */
  def fullyAuthenticatedUser[A](request: RequestHeader): Option[AuthenticatedUser] = {
    identityAuthService.getUserFromRequestUsingSCGUUCookie(request)
      .map { case (scGuUCookie, user) =>
        AuthenticatedUser(
          user = user,
          auth = ScGuU(scGuUCookie.value),
          hasRecentlyAuthenticated = hasRecentlyAuthenticate(user.id, request)
        )
      }
      .redeem(
        err => {
          logger.error("unable to authenticate user using SC_GU_U cookie", err)
          None
        },
        user => Some(user)
      )
      .unsafeRunSync()
  }

  def userIsFullyAuthenticated(request: RequestHeader): Boolean =
    fullyAuthenticatedUser(request).isDefined

  def consentCookieAuthenticatedUser(request: RequestHeader): Option[AuthenticatedUser] =
    for {
      scGuRp          <- request.cookies.get("SC_GU_RP")
      userFromScGuRp  <- identityCookieService.getUserDataForGuRp(scGuRp.value)
    } yield AuthenticatedUser(userFromScGuRp, ScGuRp(scGuRp.value))
}
