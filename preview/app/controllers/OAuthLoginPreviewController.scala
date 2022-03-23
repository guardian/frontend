package controllers

import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagementClientBuilder
import com.gu.googleauth.{AntiForgeryChecker, GoogleAuthConfig, UserIdentity}
import com.gu.play.secretrotation.{SnapshotProvider, TransitionTiming}
import conf.Configuration
import googleAuth.OAuthLoginController
import model.ApplicationContext
import play.api.http.HttpConfiguration
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, ControllerComponents, Request}

import java.time.Duration.{ofHours, ofMinutes}

class OAuthLoginPreviewController(
    val wsClient: WSClient,
    val httpConfiguration: HttpConfiguration,
    val controllerComponents: ControllerComponents,
)(implicit context: ApplicationContext)
    extends OAuthLoginController {

  override def login: Action[AnyContent] =
    Action { request =>
      Ok(views.html.previewAuth(context.applicationIdentity.name, "Dev", UserIdentity.fromRequest(request)))
    }
  override def googleAuthConfig(request: Request[AnyContent]): Option[GoogleAuthConfig] = {
    val secretStateSupplier: SnapshotProvider = {
      import com.gu.play.secretrotation.aws.parameterstore

      new parameterstore.SecretSupplier(
        TransitionTiming(usageDelay = ofMinutes(3), overlapDuration = ofHours(2)),
        "/Example/PlayAppSecret",
        parameterstore.AwsSdkV1(AWSSimpleSystemsManagementClientBuilder.defaultClient()),
      )
    }
    Configuration.standalone.oauthCredentials.map { cred =>
      GoogleAuthConfig(
        cred.oauthClientId, // The client ID from the dev console
        cred.oauthSecret, // The client secret from the dev console
        cred.oauthCallback, // The redirect URL Google send users back to (must be the same as
        // that configured in the developer console)
        List("guardian.co.uk"), // Google App domain to restrict login
        antiForgeryChecker =
          AntiForgeryChecker(secretStateSupplier, AntiForgeryChecker.signatureAlgorithmFromPlay(httpConfiguration)),
      )
    }
  }
}
