package conf

import common.GuardianConfiguration
import conf.Configuration.{OAuthCredentialsWithMultipleCallbacks, OAuthCredentials}
import pa.PaClientConfig

case class OmnitureCredentials(userName: String, secret: String)

object AdminConfiguration {
  import GuardianConfiguration._

  object pa {
    lazy val footballApiKey = configuration
      .getStringProperty("pa.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa football api key"))

    lazy val cricketApiKey = configuration
      .getStringProperty("pa.cricket.api.key")
      .getOrElse(throw new RuntimeException("unable to load pa cricket api key"))

    lazy val footballHost = PaClientConfig.baseUrl
    lazy val cricketHost = "http://cricket-api.guardianapis.com/v1"
    lazy val apiExplorer = "http://developer.press.net/io-docs"
  }

  lazy val topStoriesKey = configuration
    .getStringProperty("top-stories.config")
    .getOrElse(throw new RuntimeException("Top Stories file name is not setup"))

  object fastly {
    lazy val key =
      configuration.getStringProperty("fastly.key").getOrElse(throw new RuntimeException("Fastly key not configured"))
    lazy val serviceId = configuration
      .getStringProperty("fastly.serviceId")
      .getOrElse(throw new RuntimeException("Fastly service id not configured"))
    lazy val ajaxServiceId = configuration
      .getStringProperty("fastly.ajax.serviceId")
      .getOrElse(throw new RuntimeException("Fastly ajax service id not configured"))
  }

  object dfpApi {
    lazy val clientId = configuration.getStringProperty("api.dfp.clientId")
    lazy val clientSecret = configuration.getStringProperty("api.dfp.clientSecret")
    lazy val refreshToken = configuration.getStringProperty("api.dfp.refreshToken")
    lazy val appName = configuration.getStringProperty("api.dfp.applicationName")
  }

  lazy val oauthCredentials: Option[OAuthCredentialsWithMultipleCallbacks] =
    for {
      oauthClientId <- configuration.getStringProperty("admin.oauth.clientid")
      oauthSecret <- configuration.getStringProperty("admin.oauth.secret")
    } yield OAuthCredentialsWithMultipleCallbacks(
      oauthClientId,
      oauthSecret,
      configuration.getStringPropertiesSplitByComma("admin.oauth.callbacks"),
    )

  def oauthCredentialsWithSingleCallBack(currentHost: Option[String]): Option[OAuthCredentials] =
    oauthCredentials.flatMap { cred =>
      for {
        callback <- cred.authorizedOauthCallbacks.collectFirst {
          case defaultHost if currentHost.isEmpty =>
            defaultHost // if oauthCallbackHost is NOT defined, return the first authorized host in the list
          case host if host.startsWith(currentHost.get) =>
            host // if an authorized callback starts with current host, return it
          // otherwise None will be returned
        }
      } yield {
        Configuration.OAuthCredentials(
          cred.oauthClientId,
          cred.oauthSecret,
          callback,
        )
      }
    }

  lazy val omnitureCredentials: Option[OmnitureCredentials] =
    for {
      userName <- configuration.getStringProperty("admin.omniture.username")
      secret <- configuration.getStringProperty("admin.omniture.secret")
    } yield OmnitureCredentials(userName, secret)

  object db {
    object default {
      lazy val driver = configuration.getStringProperty("default.driver")
      lazy val url = configuration.getStringProperty("default.url")
      lazy val user = configuration.getStringProperty("default.user")
      lazy val password = configuration.getStringProperty("default.password")
    }
  }
}
