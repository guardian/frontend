package services

import idapiclient.{Auth, ScGuRp, ScGuU}
import com.gu.identity.model.User
import conf.FrontendIdentityCookieDecoder
import play.api.mvc.{Cookie, RequestHeader, Results}
import scala.language.implicitConversions
import org.joda.time.Minutes

object AuthenticatedUser {
  implicit def authUserToUser(authUser: AuthenticatedUser): User = authUser.user
}

case class AuthenticatedUser(
  user: User,
  auth: Auth,
  hasRecentlyAuthenticated: Boolean = false)

class AuthenticationService(
    cookieDecoder: FrontendIdentityCookieDecoder,
    idRequestParser: IdRequestParser,
    identityUrlBuilder: IdentityUrlBuilder) extends Results {

  /** User has SC_GU_U and GU_U cookies */
  def fullyAuthenticatedUser[A](request: RequestHeader): Option[AuthenticatedUser] =
    for {
      scGuU         <- request.cookies.get("SC_GU_U")
      guU           <- request.cookies.get("GU_U")
      userFromScGuU <- cookieDecoder.getUserDataForScGuU(scGuU.value)
      dataFromGuU   <- cookieDecoder.getUserDataForGuU(guU.value)
      if dataFromGuU.getUser.getId == userFromScGuU.getId
    } yield {
      AuthenticatedUser(
        user = dataFromGuU.getUser,
        auth = ScGuU(scGuU.value, dataFromGuU),
        hasRecentlyAuthenticated = hasRecentlyAuthenticated(dataFromGuU.getUser, request.cookies.get("SC_GU_LA")))
    }

  def consentCookieAuthenticatedUser(request: RequestHeader): Option[AuthenticatedUser] =
    for {
      scGuRp          <- request.cookies.get("SC_GU_RP")
      userFromScGuRp  <- cookieDecoder.getUserDataForGuRp(scGuRp.value)
    } yield AuthenticatedUser(userFromScGuRp, ScGuRp(scGuRp.value))

  def userIsFullyAuthenticated(request: RequestHeader): Boolean =
    fullyAuthenticatedUser(request).isDefined

  private def hasRecentlyAuthenticated(user: User, cookie: Option[Cookie]): Boolean = {
    cookie.exists(scGuLa =>
      cookieDecoder.userHasRecentScGuLaCookie(
        user,
        scGuLa.value,
        Minutes.minutes(20).toStandardDuration))
  }
}
