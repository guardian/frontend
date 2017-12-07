package services

import idapiclient.{Auth, ScGuRp, ScGuU}
import com.gu.identity.model.User
import conf.FrontendIdentityCookieDecoder
import play.api.mvc.{RequestHeader, Results}

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
    minimalSecureUser <- cookieDecoder.getUserDataForScGuU(scGuU.value)
    guUCookieData <- cookieDecoder.getUserDataForGuU(guU.value)
    fullUser = guUCookieData.getUser if (fullUser.getId == minimalSecureUser.getId)
  } yield {
    val hasRecentlyAuthenticated = request.cookies.get("SC_GU_LA").map(scgula => cookieDecoder.userHasRecentScGuLaCookie(fullUser,scgula.value, Minutes.minutes(20).toStandardDuration))
    AuthenticatedUser(fullUser, ScGuU(scGuU.value, guUCookieData), hasRecentlyAuthenticated.getOrElse(false))
  }

  def authenticateUserForPermissions(request: RequestHeader): Option[AuthenticatedUser] = for {
    scGuRp <- request.cookies.get("SC_GU_RP")
    fullUser <- cookieDecoder.getUserDataForGuRp(scGuRp.value)
  } yield AuthenticatedUser(fullUser, ScGuRp(scGuRp.value))

  def requestPresentsAuthenticationCredentials(request: RequestHeader): Boolean = authenticatedUserFor(request).isDefined

}
