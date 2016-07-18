package services

import client.{Auth, Logging}
import com.gu.identity.model.User
import conf.FrontendIdentityCookieDecoder
import idapiclient.ScGuU
import play.api.mvc.{RequestHeader, Results}
import scala.language.implicitConversions
import com.github.nscala_time.time.Imports._

object AuthenticatedUser {
  implicit def authUserToUser(authUser: AuthenticatedUser) = authUser.user
}

case class AuthenticatedUser(user: User, auth: Auth)

class AuthenticationService(cookieDecoder: FrontendIdentityCookieDecoder,
                                      idRequestParser: IdRequestParser,
                                      identityUrlBuilder: IdentityUrlBuilder) extends Logging with Results {

  def authenticatedUserFor[A](request: RequestHeader): Option[AuthenticatedUser] = for {
    scGuU <- request.cookies.get("SC_GU_U")
    guU <- request.cookies.get("GU_U")
    minimalSecureUser <- cookieDecoder.getUserDataForScGuU(scGuU.value)
    guUCookieData <- cookieDecoder.getUserDataForGuU(guU.value)
    fullUser = guUCookieData.getUser if (fullUser.getId == minimalSecureUser.getId)
  } yield AuthenticatedUser(fullUser, ScGuU(scGuU.value, guUCookieData))

  def recentlyAuthenticated(request: RequestHeader): Boolean = (for {
    authedUser <- authenticatedUserFor(request)
    scGuLa <- request.cookies.get("SC_GU_LA")
  } yield cookieDecoder.userHasRecentScGuLaCookie(authedUser, scGuLa.value, 20.minutes)).getOrElse(false)

  def requestPresentsAuthenticationCredentials(request: RequestHeader) = authenticatedUserFor(request).isDefined

}
