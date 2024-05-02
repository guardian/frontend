package http

import com.amazonaws.services.s3.AmazonS3
import com.gu.pandomainauth.action.AuthActions
import com.gu.pandomainauth.model.AuthenticatedUser
import com.gu.pandomainauth.{PanDomain, PanDomainAuthSettingsRefresher}
import common.Environment.stage
import model.ApplicationContext
import org.apache.pekko.stream.Materializer
import play.api.Mode
import play.api.libs.ws.WSClient
import play.api.mvc.{BaseController, _}

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
)(implicit
    val mat: Materializer,
    context: ApplicationContext,
) extends AuthActions
    with BaseController {

  private val outer = this

  private def toolsDomainSuffix =
    stage match {
      case "PROD" => "gutools.co.uk"
      case "CODE" => "code.dev-gutools.co.uk"
      case _      => s"local.dev-gutools.co.uk" // covers DEV, LOCAL, tests etc.
    }

  override def panDomainSettings =
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
        // TODO: in future PR add a permission check here based on user, likely via a function passed in to GuardianAuthWithExemptions
        AuthAction.authenticateRequest(request) { user =>
          nextFilter(request)
        }
      }
    }
  }
}
