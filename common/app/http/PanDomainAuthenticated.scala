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
import com.gu.permissions.{PermissionDefinition, PermissionsProvider}

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

  trait AuthenticationResult

  case class AuthenticationFailure(status: Int, reason: String) extends AuthenticationResult

  case class AuthenticationSuccess(user: Option[AuthenticatedUser]) extends AuthenticationResult

  protected def evaluatePandaAuth(
      authorizationHeader: String,
      permissions: PermissionsProvider,
  ): Option[AuthenticationResult] = {
    val authHeaderParts = authorizationHeader.split(" ")

    val requiredPermission = PermissionDefinition(
      name = "preview_access",
      app = "frontend",
    )

    if (authHeaderParts.length != 2 || authHeaderParts.head.toLowerCase != "gu-desktop-panda") {
      Some(
        AuthenticationFailure(
          status = 401,
          reason = "presented Authorization header using incorrect scheme",
        ),
      )
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
        case Expired(authedUser) =>
          Some(
            AuthenticationFailure(
              status = 419,
              reason = s"user ${authedUser.user.email} login expired, returning 419",
            ),
          )

        case NotAuthorized(authedUser) =>
          Some(
            AuthenticationFailure(
              status = 403,
              reason = s"user ${authedUser.user.email} failed validation",
            ),
          )

        case InvalidCookie(exception) =>
          Some(
            AuthenticationFailure(
              status = 403,
              reason = "could not validate cookie",
            ),
          )

        case NotAuthenticated =>
          Some(
            AuthenticationFailure(
              status = 401,
              reason = "user did not present a token",
            ),
          )

        case GracePeriod(authedUser)
            if permissions.hasPermission(
              requiredPermission,
              authedUser.user.email,
            ) =>
          // continue
          Some(AuthenticationSuccess(user = Some(authedUser)))

        case Authenticated(authedUser) if (permissions.hasPermission(requiredPermission, authedUser.user.email)) =>
          // continue
          Some(AuthenticationSuccess(user = Some(authedUser)))

        case _ => // authed but not allowed ComposerAccess
          Some(
            AuthenticationFailure(
              status = 403,
              reason = "insufficient-permissions",
            ),
          )
      }
    }
  }
}
