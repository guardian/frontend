package conf

import com.gu.googleauth.GoogleAuthConfig

object GoogleAuth {
  val config = AdminConfiguration.oauthCredentials.map { cred =>
    GoogleAuthConfig(
      cred.oauthClientId,     // The client ID from the dev console
      cred.oauthSecret,       // The client secret from the dev console
      cred.oauthCallback,     // The redirect URL Google send users back to (must be the same as
      // that configured in the developer console)
      Some("guardian.co.uk"), // Google App domain to restrict login
      None
    )
  }

  def getConfigOrDie = config getOrElse {
    throw new RuntimeException("You must set up credentials for Google Auth")
  }
}
