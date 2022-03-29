package conf

import conf.Configuration.OAuthCredentials
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
    oauthCredentials: Option[OAuthCredentials],
) {
  private val frontendCredentialsProvider = new AWSCredentialsProviderChain(
    Configuration.aws.mandatoryCredentials,
  )
  private val ssmClient = AWSSimpleSystemsManagementClientBuilder
    .standard()
    .withCredentials(frontendCredentialsProvider)
    .withRegion(Regions.EU_WEST_1)
    .build()

  val secretStateSupplier: SnapshotProvider = {
    import com.gu.play.secretrotation.aws.parameterstore

    new parameterstore.SecretSupplier(
      TransitionTiming(usageDelay = ofMinutes(3), overlapDuration = ofHours(2)),
      Configuration.googleOAuth.playAppSecretParameterName,
      parameterstore.AwsSdkV1(ssmClient),
    )
  }

  val config = oauthCredentials.map { cred =>
    GoogleAuthConfig(
      cred.oauthClientId, // The client ID from the dev console
      cred.oauthSecret, // The client secret from the dev console
      cred.oauthCallback, // The redirect URL Google send users back to (must be the same as that configured in the developer console)
      List("guardian.co.uk"), // Google App domain to restrict login
      antiForgeryChecker =
        AntiForgeryChecker(secretStateSupplier, AntiForgeryChecker.signatureAlgorithmFromPlay(httpConfiguration)),
    )
  }

  def getConfigOrDie: GoogleAuthConfig =
    config getOrElse {
      throw new RuntimeException("You must set up credentials for Google Auth")
    }
}
