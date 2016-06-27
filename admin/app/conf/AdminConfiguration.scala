package conf

import com.gu.conf.ConfigurationFactory
import conf.Configuration.OAuthCredentialsWithMultipleCallbacks
import pa.PaClientConfig

case class OmnitureCredentials(userName: String, secret: String)

object AdminConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  object pa {
    lazy val footballApiKey = configuration.getStringProperty("pa.api.key")
        .getOrElse(throw new RuntimeException("unable to load pa football api key"))

    lazy val cricketApiKey = configuration.getStringProperty("pa.cricket.api.key")
        .getOrElse(throw new RuntimeException("unable to load pa cricket api key"))

    lazy val footballHost = PaClientConfig.baseUrl
    lazy val cricketHost = "http://cricket.api.press.net/v1"
    lazy val apiExplorer = "http://developer.press.net/io-docs"
  }

  lazy val topStoriesKey = configuration.getStringProperty("top-stories.config").getOrElse(throw new RuntimeException("Top Stories file name is not setup"))

  object fastly {
    lazy val key = configuration.getStringProperty("fastly.key").getOrElse(throw new RuntimeException("Fastly key not configured"))
    lazy val serviceId = configuration.getStringProperty("fastly.serviceId").getOrElse(throw new RuntimeException("Fastly service id not configured"))
  }

  object imgix {
    lazy val key = configuration.getStringProperty("imgix.key").getOrElse(throw new RuntimeException("Imgix key not configured"))
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
      } yield OAuthCredentialsWithMultipleCallbacks(oauthClientId, oauthSecret, configuration.getStringPropertiesSplitByComma("admin.oauth.callbacks"))

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
