package http

import com.gu.pandomainauth.model._
import com.gu.pandomainauth.{PanDomain, PublicSettings}
import common.Environment.stage
import common.GuLogging
import implicits.Requests
import play.api.http.HeaderNames
import play.api.mvc.{RequestHeader, Result, Results}
import utils.AWSv2.S3Sync

import java.time.Duration
import scala.concurrent.Future

class PanDomainDesktopAuthentication
    extends CustomPanDomainAuth
    with Requests
    with HeaderNames
    with GuLogging
    with Results {

  private val desktopDomain = stage match {
    case "DEV"  => "local"
    case "CODE" => "code"
    case "PROD" => "prod"
  }

  private lazy val domain: String = s"$desktopDomain.integration.flexible.gnm"
  private lazy val bucket: String = "pan-domain-auth-settings"
  lazy val system = "frontend"

  private val settingsRefresher = {
    val theRefresher = new PublicSettings(
      settingsFileKey = s"$domain.settings",
      bucketName = bucket,
      s3Client = S3Sync,
    )
    theRefresher.start()
    theRefresher
  }

  private def evaluatePandaAuth(authenticationHeader: String): Either[String, AuthenticatedUser] = {
    val authHeaderParts = authenticationHeader.split(" ")

    if (authHeaderParts.length != 2 || authHeaderParts.head.toLowerCase != "gu-desktop-panda") {
      Left("presented Authorization header using incorrect scheme")
    } else {
      val authStatus = PanDomain.authStatus(
        cookieData = authHeaderParts.last,
        verification = settingsRefresher.verification,
        validateUser = PanDomain.guardianValidation,
        apiGracePeriod = Duration.ofHours(9),
        system = "login-desktop",
        cacheValidation = true,
        forceExpiry = false,
      )

      authStatus match {
        case Expired(authedUser)       => Left(s"user ${authedUser.user.email} login expired")
        case NotAuthorized(authedUser) => Left(s"user ${authedUser.user.email} failed validation")
        case InvalidCookie(_)          => Left("could not validate cookie")
        case NotAuthenticated          => Left("user did not present a token")
        case GracePeriod(authedUser)   => Right(authedUser)
        case Authenticated(authedUser) => Right(authedUser)
      }
    }
  }

  override def appliesTo(request: RequestHeader): Boolean = request.isDesktopAuthRequest

  override def authenticateRequest(
      request: RequestHeader,
  )(produceResultGivenAuthedUser: User => Future[Result]): Future[Result] =
    request.headers
      .get(AUTHORIZATION)
      .toRight(s"No '$AUTHORIZATION' header provided")
      .flatMap(evaluatePandaAuth)
      .fold(
        errorMessage => {
          log.warn(errorMessage)
          Future.successful(Unauthorized)
        },
        authenticatedUser => produceResultGivenAuthedUser(authenticatedUser.user),
      )
}
