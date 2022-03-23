package conf

import conf.Configuration.OAuthCredentialsWithMultipleCallbacks
import com.amazonaws.auth.AWSCredentialsProviderChain
import com.amazonaws.regions.Regions
import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagementClientBuilder
import com.gu.googleauth.{AntiForgeryChecker, GoogleAuthConfig}
import com.gu.play.secretrotation.{SnapshotProvider, TransitionTiming}
import play.api.http.HttpConfiguration

import java.time.Duration.{ofHours, ofMinutes}

case class GoogleAuth(
    currentHost: Option[String],
    httpConfiguration: HttpConfiguration,
    oauthCredentials: Option[OAuthCredentialsWithMultipleCallbacks],
) {
  private val securityCredentialsProvider = new AWSCredentialsProviderChain(
    Configuration.aws.mandatoryCredentials,
  )
  private val ssmClient = AWSSimpleSystemsManagementClientBuilder
    .standard()
    .withCredentials(securityCredentialsProvider)
    .withRegion(Regions.EU_WEST_1)
    .build()

  val secretStateSupplier: SnapshotProvider = {
    import com.gu.play.secretrotation.aws.parameterstore

    new parameterstore.SecretSupplier(
      TransitionTiming(usageDelay = ofMinutes(3), overlapDuration = ofHours(2)),
      "/frontend/PlayAppSecret",
      parameterstore.AwsSdkV1(ssmClient),
    )
  }

  val config = oauthCredentials.flatMap { cred =>
    for {
      callback <- cred.authorizedOauthCallbacks.collectFirst {
        case defaultHost if currentHost.isEmpty =>
          defaultHost // if oauthCallbackHost is NOT defineed, return the first authorized host in the list
        case host if host.startsWith(currentHost.get) =>
          host // if an authorized callback starts with current host, return it
        // otherwise None will be returned
      }
    } yield {
      GoogleAuthConfig(
        cred.oauthClientId, // The client ID from the dev console
        cred.oauthSecret, // The client secret from the dev console
        callback, // The redirect URL Google send users back to (must be the same as that configured in the developer console)
        List("guardian.co.uk"), // Google App domain to restrict login
        antiForgeryChecker =
          AntiForgeryChecker(secretStateSupplier, AntiForgeryChecker.signatureAlgorithmFromPlay(httpConfiguration)),
      )
    }
  }

  def getConfigOrDie: GoogleAuthConfig =
    config getOrElse {
      throw new RuntimeException("You must set up credentials for Google Auth")
    }
}
