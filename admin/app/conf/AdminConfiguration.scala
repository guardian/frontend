package conf

import common.GuardianConfiguration
import conf.Configuration.OAuthCredentialsWithMultipleCallbacks
import pa.PaClientConfig

case class OmnitureCredentials(userName: String, secret: String)

object AdminConfiguration {
  import GuardianConfiguration._

  object pa {
    lazy val footballApiKey = guardianConfiguration.getStringProperty("pa.api.key")
        .getOrElse(throw new RuntimeException("unable to load pa football api key"))

    lazy val cricketApiKey = guardianConfiguration.getStringProperty("pa.cricket.api.key")
        .getOrElse(throw new RuntimeException("unable to load pa cricket api key"))

    lazy val footballHost = PaClientConfig.baseUrl
    lazy val cricketHost = "http://cricket.api.press.net/v1"
    lazy val apiExplorer = "http://developer.press.net/io-docs"
  }

  lazy val topStoriesKey = guardianConfiguration.getStringProperty("top-stories.config").getOrElse(throw new RuntimeException("Top Stories file name is not setup"))

  object fastly {
    lazy val key = guardianConfiguration.getStringProperty("fastly.key").getOrElse(throw new RuntimeException("Fastly key not configured"))
    lazy val serviceId = guardianConfiguration.getStringProperty("fastly.serviceId").getOrElse(throw new RuntimeException("Fastly service id not configured"))
  }

  object imgix {
    lazy val key = guardianConfiguration.getStringProperty("imgix.key").getOrElse(throw new RuntimeException("Imgix key not configured"))
  }

  object dfpApi {
    lazy val clientId = guardianConfiguration.getStringProperty("api.dfp.clientId")
    lazy val clientSecret = guardianConfiguration.getStringProperty("api.dfp.clientSecret")
    lazy val refreshToken = guardianConfiguration.getStringProperty("api.dfp.refreshToken")
    lazy val appName = guardianConfiguration.getStringProperty("api.dfp.applicationName")
  }

  lazy val oauthCredentials: Option[OAuthCredentialsWithMultipleCallbacks] =
      for {
        oauthClientId <- guardianConfiguration.getStringProperty("admin.oauth.clientid")
        oauthSecret <- guardianConfiguration.getStringProperty("admin.oauth.secret")
      } yield OAuthCredentialsWithMultipleCallbacks(oauthClientId, oauthSecret, guardianConfiguration.getStringPropertiesSplitByComma("admin.oauth.callbacks"))

  lazy val omnitureCredentials: Option[OmnitureCredentials] =
    for {
      userName <- guardianConfiguration.getStringProperty("admin.omniture.username")
      secret <- guardianConfiguration.getStringProperty("admin.omniture.secret")
    } yield OmnitureCredentials(userName, secret)

  object db {
    object default {
      lazy val driver = guardianConfiguration.getStringProperty("default.driver")
      lazy val url = guardianConfiguration.getStringProperty("default.url")
      lazy val user = guardianConfiguration.getStringProperty("default.user")
      lazy val password = guardianConfiguration.getStringProperty("default.password")
    }
  }
}
