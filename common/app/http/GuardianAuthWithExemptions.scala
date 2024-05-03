package http

import com.amazonaws.regions.Regions
import com.amazonaws.services.s3.AmazonS3
import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.{PanDomain, PanDomainAuthSettingsRefresher}
import com.gu.permissions.{PermissionDefinition, PermissionsConfig, PermissionsProvider}
import common.Environment.stage
import conf.Configuration.aws.mandatoryCredentials
import model.ApplicationContext
import org.apache.pekko.stream.Materializer
import org.slf4j.LoggerFactory
import play.api.Mode
import play.api.libs.ws.WSClient
import play.api.mvc._

import java.net.URL
import scala.concurrent.Future

class GuardianAuthWithExemptions(
    override val controllerComponents: ControllerComponents,
    override val wsClient: WSClient,
    toolsDomainPrefix: String,
    oauthCallbackPath: String,
    s3Client: AmazonS3,
    system: String,
    extraDoNotAuthenticatePathPrefixes: Seq[String],
    requiredEditorialPermissionName: String,
)(implicit
    val mat: Materializer,
    context: ApplicationContext,
) extends AuthActions
    with BaseController {

  private val outer = this

  val logger = LoggerFactory.getLogger(this.getClass)

  private val permissions: PermissionsProvider = PermissionsProvider(
    PermissionsConfig(
      stage = if (stage == "PROD") "PROD" else "CODE",
      region = Regions.EU_WEST_1.getName,
      awsCredentials = mandatoryCredentials,
    ),
  )

  private val requiredPermission = PermissionDefinition(
    name = requiredEditorialPermissionName,
    app = "frontend",
  )

  private def toolsDomainSuffix =
    stage match {
      case "PROD" => "gutools.co.uk"
      case "CODE" => "code.dev-gutools.co.uk"
      case _      => s"local.dev-gutools.co.uk" // covers DEV, LOCAL, tests etc.
    }

  override val panDomainSettings =
    new PanDomainAuthSettingsRefresher(
      domain = toolsDomainSuffix,
      system,
      bucketName = "pan-domain-auth-settings",
      settingsFileKey = s"$toolsDomainSuffix.settings",
      s3Client,
    )

  override def authCallbackUrl = s"https://$toolsDomainPrefix.$toolsDomainSuffix$oauthCallbackPath"

  override def validateUser(authedUser: AuthenticatedUser): Boolean = {
    PanDomain.guardianValidation(authedUser)
  }

  /**
    * By default, the user validation method is called every request. If your validation
    * method has side-effects or is expensive (perhaps hitting a database), setting this
    * to true will ensure that validateUser is only called when the OAuth session is refreshed
    */
  override def cacheValidation = false

  def oauthCallback: Action[AnyContent] =
    Action.async { implicit request =>
      processOAuthCallback()
    }

  val filter: Filter = new Filter {

    override val mat: Materializer = outer.mat

    private def doNotAuthenticate(request: RequestHeader) =
      context.environment.mode == Mode.Test ||
        (List(
          new URL(authCallbackUrl).getPath, // oauth callback
          "/assets",
          "/favicon.ico",
          "/_healthcheck",
        ) ++ extraDoNotAuthenticatePathPrefixes).exists(request.path.startsWith)

    def apply(nextFilter: RequestHeader => Future[Result])(request: RequestHeader): Future[Result] = {
      if (doNotAuthenticate(request)) {
        nextFilter(request)
      } else {
        AuthAction.authenticateRequest(request) { user =>
          if (permissions.hasPermission(requiredPermission, user.email)) {
            nextFilter(request)
          } else {
//            Future.successful(
//              Results.Forbidden(
//                s"You do not have permission to access $system. " +
//                  s"You should contact Central Production to request '$requiredEditorialPermissionName' permission.",
//              ),
//            )
            logger.warn(s"${user.email} used $system, but didn't have '$requiredEditorialPermissionName' permission.")
            nextFilter(request)
          }
        }
      }
    }
  }
}
