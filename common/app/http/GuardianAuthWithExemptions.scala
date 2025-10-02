package http

import com.amazonaws.regions.Regions
import software.amazon.awssdk.core.sync.ResponseTransformer
import software.amazon.awssdk.services.s3.S3Client
import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.{PanDomain, PanDomainAuthSettingsRefresher, S3BucketLoader}
import com.gu.permissions.{PermissionDefinition, PermissionsConfig, PermissionsProvider}
import com.gu.pandahmac.{HMACAuthActions, HMACHeaderNames}
import common.Environment.stage
import common.GuLogging
import conf.Configuration.aws.mandatoryCredentials
import model.ApplicationContext
import org.apache.pekko.stream.Materializer
import play.api.Mode
import play.api.libs.ws.WSClient
import play.api.mvc._
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest

import scala.util.Try
import java.net.{URI, URL}
import scala.concurrent.Future

class GuardianAuthWithExemptions(
    override val controllerComponents: ControllerComponents,
    override val wsClient: WSClient,
    toolsDomainPrefix: String,
    oauthCallbackPath: String,
    s3Client: S3Client,
    secretsClient: SecretsManagerClient,
    system: String,
    extraDoNotAuthenticatePathPrefixes: Seq[String],
    requiredEditorialPermissionName: String,
)(implicit
    val mat: Materializer,
    context: ApplicationContext,
) extends AuthActions
    with HMACAuthActions
    with BaseController
    with GuLogging {

  private val outer = this

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

  override lazy val panDomainSettings = PanDomainAuthSettingsRefresher(
    domain = toolsDomainSuffix,
    system,
    new S3BucketLoader {
      def inputStreamFetching(key: String) =
        s3Client.getObject(
          _.bucket("pan-domain-auth-settings").key(key),
          ResponseTransformer.toInputStream(),
        )
    },
  )

  private val hmacSecretStages = List("AWSCURRENT", "AWSPREVIOUS")

  override def secretKeys: List[String] = hmacSecretStages.flatMap { secretStage =>
    val valueRequest = GetSecretValueRequest
      .builder()
      .secretId(s"/${stage.toUpperCase}/frontend/preview/hmacSecretKey")
      .build()

    val result = Try {
      val result = secretsClient
        .getSecretValue(valueRequest)
        .secretString
      Some(result)
    }.recover { error =>
      log.warn(s"Could not fetch secret for ${secretStage}: ", error)
      None
    }.get

    result
  }

  override def authCallbackUrl = s"https://$toolsDomainPrefix.$toolsDomainSuffix$oauthCallbackPath"

  override def validateUser(authedUser: AuthenticatedUser): Boolean = {
    PanDomain.guardianValidation(authedUser)
  }

  /** By default, the user validation method is called every request. If your validation method has side-effects or is
    * expensive (perhaps hitting a database), setting this to true will ensure that validateUser is only called when the
    * OAuth session is refreshed
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

    def validateHMACRequestHeader(requestHeader: RequestHeader): Boolean = {
      val oHmac: Option[String] = requestHeader.headers.get(HMACHeaderNames.hmacKey)
      val oDate: Option[String] = requestHeader.headers.get(HMACHeaderNames.dateKey)
      val oServiceName: Option[String] = requestHeader.headers.get(HMACHeaderNames.serviceNameKey)
      val uri = new URI(requestHeader.uri)

      (oHmac, oDate) match {
        case (Some(hmac), Some(date)) if validateHMACHeaders(date, hmac, uri) =>
          log.info(s"User from $oServiceName successfully validated with HMAC.")
          true
        case _ =>
          log.info(s"User from $oServiceName could not be validated with HMAC.")
          false
      }
    }

    def apply(nextFilter: RequestHeader => Future[Result])(request: RequestHeader): Future[Result] = {
      if (doNotAuthenticate(request)) {
        nextFilter(request)
      } else if (validateHMACRequestHeader(request)) {
        nextFilter(request)
      } else {
        AuthAction.authenticateRequest(request) { user =>
          if (permissions.hasPermission(requiredPermission, user.email)) {
            nextFilter(request)
          } else {
            Future.successful(
              Results.Forbidden(
                s"You do not have permission to access $system. " +
                  s"You should contact Central Production to request '$requiredEditorialPermissionName' permission.",
              ),
            )
          }
        }
      }
    }
  }
}
