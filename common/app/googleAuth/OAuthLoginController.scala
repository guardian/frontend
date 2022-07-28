package googleAuth

import com.gu.googleauth.{GoogleAuth, GoogleAuthConfig, UserIdentity}
import common.{Crypto, ImplicitControllerExecutionContext, GuLogging}
import conf.Configuration
import org.joda.time.DateTime
import play.api.http.HttpConfiguration
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.mvc._

import scala.concurrent.Future

trait OAuthLoginController extends BaseController with ImplicitControllerExecutionContext with implicits.Requests {

  implicit def wsClient: WSClient
  def login: Action[AnyContent]
  def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig]
  def httpConfiguration: HttpConfiguration

  val authCookie = new AuthCookie(httpConfiguration)

  val LOGIN_ORIGIN_KEY = "loginOriginUrl"
  val ANTI_FORGERY_KEY = "play-googleauth-session-id"
  val forbiddenNoCredentials = Forbidden("Invalid OAuth credentials set")
  lazy val validRedirectDomain = """^(\w+:\/\/[^/]+\.(?:dev-)?gutools\.co\.uk\/.*)$""".r

  /*
  Redirect to Google with anti forgery token (that we keep in session storage - note that flashing is NOT secure)
   */
  def loginAction: Action[AnyContent] =
    Action.async { implicit request =>
      googleAuthConfig(request)
        .flatMap(overrideRedirectUrl)
        .map { config =>
          config.antiForgeryChecker.ensureUserHasSessionId { sessionId =>
            GoogleAuth.redirectToGoogle(config, sessionId)
          }
        }
        .getOrElse(Future.successful(forbiddenNoCredentials))
    }

  // Allow redirect url to be overridden via request params. Only allows gutools.co.uk
  private def overrideRedirectUrl(config: GoogleAuthConfig)(implicit request: RequestHeader) = {
    request.getQueryString("redirect-url") match {
      case Some(validRedirectDomain(url)) => Some(config.copy(redirectUrl = url))
      case None                           => Some(config)
      case _                              => None
    }
  }

  /*
  User comes back from Google.
  We must ensure we have the anti forgery token from the loginAction call and pass this into a verification call which
  will return a Future[UserIdentity] if the authentication is successful. If unsuccessful then the Future will fail.
   */
  def oauth2Callback: Action[AnyContent] =
    Action.async { implicit request =>
      googleAuthConfig(request)
        .flatMap(overrideRedirectUrl)
        .map { config =>
          request.session.get(ANTI_FORGERY_KEY) match {
            case None =>
              Future.successful(
                Redirect("/login").withNewSession
                  .flashing("error" -> "Anti forgery token missing in session"),
              )
            case Some(token) =>
              GoogleAuth
                .validatedUserIdentity(config)
                // drop the avatarUrl as it can be very large and we don't use it anywhere
                .map(_.copy(avatarUrl = None))
                .map { userIdentity: UserIdentity =>
                  // We store the URL a user was trying to get to in the LOGIN_ORIGIN_KEY in AuthAction
                  // Redirect a user back there now if it exists
                  val redirect = request.session.get(LOGIN_ORIGIN_KEY) match {
                    case Some(url) => Redirect(url)
                    case None      => Redirect("/")
                  }
                  // Store the JSON representation of the identity in the session - this is checked by AuthAction later
                  val sessionAdd: Seq[(String, String)] = Seq(
                    Option((UserIdentity.KEY, Json.toJson(userIdentity).toString())),
                    Option((Configuration.cookies.lastSeenKey, DateTime.now.toString())),
                  ).flatten

                  val result = redirect
                    .addingToSession(sessionAdd: _*)
                    .removingFromSession(ANTI_FORGERY_KEY, LOGIN_ORIGIN_KEY)

                  authCookie
                    .from(userIdentity)
                    .map(authCookie => result.withCookies(authCookie))
                    .getOrElse(result)
                } recover {
                case t =>
                  // you might want to record login failures here - we just redirect to the login page
                  Redirect("/login")
                    .withSession(request.session - ANTI_FORGERY_KEY)
                    .flashing("error" -> s"Login failure: ${t.toString}")
              }
          }
        }
        .getOrElse(Future.successful(forbiddenNoCredentials))
    }

  def logout: Action[AnyContent] =
    Action { implicit request =>
      Redirect("/login").withNewSession
    }
}

class AuthCookie(httpConfiguration: HttpConfiguration) extends GuLogging {

  private val cookieName = "GU_PV_AUTH"
  private val oneDayInSeconds: Int = 86400

  def from(id: UserIdentity): Option[Cookie] = {
    val idWith30DayExpiry = id.copy(exp = (System.currentTimeMillis() / 1000) + oneDayInSeconds)
    Some(
      Cookie(
        cookieName,
        Crypto.encryptAES(Json.toJson(idWith30DayExpiry).toString, httpConfiguration.secret.secret),
        Some(oneDayInSeconds),
      ),
    )
  }

  def toUserIdentity(request: RequestHeader): Option[UserIdentity] = {
    try {
      request.cookies.get(cookieName).flatMap { cookie =>
        UserIdentity.fromJson(Json.parse(Crypto.decryptAES(cookie.value, httpConfiguration.secret.secret)))
      }
    } catch {
      case e: Exception =>
        log.error("Could not parse Auth Cookie", e)
        None
    }
  }
}
