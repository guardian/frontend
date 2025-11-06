package http

import com.amazonaws.services.s3.{AmazonS3, AmazonS3ClientBuilder}
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
import common.Environment.{awsRegion, stage}
import conf.Configuration.aws.mandatoryCredentials

import scala.concurrent.duration.DurationInt
import com.gu.pandomainauth.PublicSettings

trait PanDomainAuthenticated {

  private val desktopDomain = stage match {
    case "DEV"  => "local"
    case "CODE" => "code"
    case "PROD" => "prod"
  }

  lazy val domain: String = s"$desktopDomain.integration.flexible.gnm"
  lazy val bucket: String = "pan-domain-auth-settings"
  lazy val system = "frontend"

  lazy val s3: AmazonS3 = AmazonS3ClientBuilder
    .standard()
    .withCredentials(mandatoryCredentials)
    .withRegion(awsRegion)
    .build()

  private val settingsRefresher = {
    val theRefresher = new PublicSettings(
      settingsFileKey = s"$domain.settings",
      bucketName = "pan-domain-auth-settings",
      s3Client = s3,
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
        apiGracePeriod = 9.hours.toMillis,
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
