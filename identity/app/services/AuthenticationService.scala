package services

import idapiclient.{Auth, ScGuRp, ScGuU}
import com.gu.identity.model.User
import conf.FrontendIdentityCookieDecoder
import play.api.mvc.{Cookie, RequestHeader, Results}

import scala.language.implicitConversions
import org.joda.time.Minutes
import utils.Logging

object AuthenticatedUser {
  implicit def authUserToUser(authUser: AuthenticatedUser): User = authUser.user
}

case class AuthenticatedUser(user: User, auth: Auth, hasRecentlyAuthenticated: Boolean = false)

class AuthenticationService(cookieDecoder: FrontendIdentityCookieDecoder,
                            idRequestParser: IdRequestParser,
                            identityUrlBuilder: IdentityUrlBuilder) extends Logging with Results {

  def authenticatedUserFor[A](request: RequestHeader): Option[AuthenticatedUser] = for {
    scGuU <- request.cookies.get("SC_GU_U")
    guU <- request.cookies.get("GU_U")
    scGuLaOpt = request.cookies.get("SC_GU_LA")
    minimalSecureUser <- cookieDecoder.getUserDataForScGuU(scGuU.value)
    guUCookieData <- cookieDecoder.getUserDataForGuU(guU.value)
    fullUser = guUCookieData.getUser if fullUser.getId == minimalSecureUser.getId
  } yield {
    AuthenticatedUser(fullUser, ScGuU(scGuU.value, guUCookieData), hasRecentlyAuthenticated(fullUser, scGuLaOpt))
  }

  def hasRecentlyAuthenticated(user: User, cookie: Option[Cookie]): Boolean = {
    cookie.exists(scGuLa => cookieDecoder.userHasRecentScGuLaCookie(user, scGuLa.value, Minutes.minutes(20).toStandardDuration))
  }

  def authenticateUserForPermissions(request: RequestHeader): Option[AuthenticatedUser] = {
    for {
      scGuRp <- request.cookies.get("SC_GU_RP")
      fullUser <- cookieDecoder.getUserDataForGuRp(scGuRp.value)
    } yield AuthenticatedUser(fullUser, ScGuRp(scGuRp.value))
  }

  def requestPresentsAuthenticationCredentials(request: RequestHeader): Boolean = authenticatedUserFor(request).isDefined

}
