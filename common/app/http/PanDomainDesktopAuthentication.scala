package http

import com.gu.pandomainauth.PanDomain
import com.gu.pandomainauth.model.{
  Authenticated,
  AuthenticatedUser,
  Expired,
  GracePeriod,
  InvalidCookie,
  NotAuthenticated,
  NotAuthorized,
}
import common.Environment.stage

import com.gu.pandomainauth.PublicSettings
import utils.AWSv2.S3Sync
import java.time.Duration

trait PanDomainDesktopAuthentication {

  private val desktopDomain = stage match {
    case "DEV"  => "local"
    case "CODE" => "code"
    case "PROD" => "prod"
  }

  lazy val domain: String = s"$desktopDomain.integration.flexible.gnm"
  lazy val bucket: String = "pan-domain-auth-settings"
  lazy val system = "frontend"

  private val settingsRefresher = {
    val theRefresher = new PublicSettings(
      settingsFileKey = s"$domain.settings",
      bucketName = "pan-domain-auth-settings",
      s3Client = S3Sync,
    )
    theRefresher.start()
    theRefresher
  }

  protected def evaluatePandaAuth(
      authenticationHeader: String,
  ): Either[String, AuthenticatedUser] = {
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
}
