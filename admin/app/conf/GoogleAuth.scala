package conf

import com.gu.googleauth.GoogleAuthConfig

case class GoogleAuth(currentHost: Option[String]) {
  val config = AdminConfiguration.oauthCredentials.flatMap { cred =>
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
        "guardian.co.uk", // Google App domain to restrict login
      )
    }
  }

  def getConfigOrDie: GoogleAuthConfig =
    config getOrElse {
      throw new RuntimeException("You must set up credentials for Google Auth")
    }
}

object GoogleAuth extends GoogleAuth(None)
